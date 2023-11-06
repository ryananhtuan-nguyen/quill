import React, {
  ReactNode,
  createContext,
  useContext,
  useRef,
  useState,
} from 'react'
import { useToast } from '../ui/use-toast'
import { useMutation } from '@tanstack/react-query'
import { trpc } from '@/app/_trpc/client'
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query'

type StreamResponse = {
  addMessage: () => void
  message: string
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  isLoading: boolean
}

export const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: '',
  handleInputChange: () => {},
  isLoading: false,
})

interface Props {
  fileId: string
  children: ReactNode
}

export const ChatContextProvider = ({ fileId, children }: Props) => {
  const [message, setMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { toast } = useToast()

  const utils = trpc.useUtils()

  const {} = useContext(ChatContext)

  const backupMessage = useRef<string>('')

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await fetch('/api/message', {
        method: 'POST',
        body: JSON.stringify({ fileId, message }),
      })
      if (!response.ok) {
        throw new Error('Failed to send message')
      }
      return response.body
    },
    onMutate: async ({ message }) => {
      backupMessage.current = message
      setMessage('')
      //step 1
      await utils.getFileMessages.cancel()

      //step 2
      const previousMessages = utils.getFileMessages.getInfiniteData()

      //step3
      utils.getFileMessages.setInfiniteData(
        { fileId, limit: INFINITE_QUERY_LIMIT },
        //finding old messages
        (old) => {
          //if theres no messages, return empty array
          if (!old) {
            return {
              pages: [],
              pageParams: [],
            }
          }

          //else
          //get new messages
          let newPages = [...old.pages]
          //get latest pages
          let latestPage = newPages[0]!
          //mutate
          latestPage.messages = [
            {
              createdAt: new Date().toISOString(),
              id: crypto.randomUUID(),
              text: message,
              isUserMessage: true,
            },
            ...latestPage.messages,
          ]
          //swap them
          newPages[0] = latestPage
          //return
          return { ...old, pages: newPages }
        }
      )
      //loading after inserting message, not before
      setIsLoading(true)

      return {
        previousMessages:
          previousMessages?.pages.flatMap((page) => page.messages) ?? [],
      }
    },
    //handle Success
    onSuccess: async (stream) => {
      //remove loading state
      setIsLoading(false)
      //If theres no stream response, toast error
      if (!stream) {
        return toast({
          title: 'There was a problem sending the message',
          description: 'Please refresh this page and try again',
          variant: 'destructive',
        })
      }
      //get the stream back
      const reader = stream.getReader()
      //decode the stream
      const decoder = new TextDecoder()
      //keep track of the decoding process
      let done = false

      // accumulated response
      let accResponse = ''

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value)

        accResponse += chunkValue

        //append chunk to actual message
        utils.getFileMessages.setInfiniteData(
          {
            fileId,
            limit: INFINITE_QUERY_LIMIT,
          },
          (old) => {
            if (!old) return { pages: [], pageParams: [] }
            //check for each chunks if theres an AI messages already
            let isAiResponseCreated = old.pages.some((page) =>
              page.messages.some((message) => message.id === 'ai-response')
            )
            //update the page
            let updatedPages = old.pages.map((page) => {
              if (page === old.pages[0]) {
                //means we are in the first page
                let updatedMessages
                //if theres no AI response yet
                if (!isAiResponseCreated) {
                  updatedMessages = [
                    {
                      createdAt: new Date().toISOString(),
                      id: 'ai-response',
                      text: accResponse,
                      isUserMessage: false,
                    },
                    ...page.messages,
                  ]
                  //else if there is Ai respons already
                } else {
                  updatedMessages = page.messages.map((message) => {
                    //if the message is AI response
                    if (message.id === 'ai-response') {
                      return {
                        ...message,
                        text: accResponse,
                      }
                    }
                    //if not return message as it
                    return message
                  })
                }

                return {
                  ...page,
                  messages: updatedMessages,
                }
              }

              return page
            })

            return { ...old, pages: updatedPages }
          }
        )
      }
    },
    //handle Erorr
    onError: (_, __, context) => {
      //put message back into input field
      setMessage(backupMessage.current)
      //rollback messages
      utils.getFileMessages.setData(
        { fileId },
        { messages: context?.previousMessages ?? [] }
      )
    },
    //handle onsettled
    onSettled: async () => {
      //remove loading
      setIsLoading(false)
      //refresh datas
      await utils.getFileMessages.invalidate({ fileId })
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
  }

  const addMessage = () => sendMessage({ message })

  return (
    <ChatContext.Provider
      value={{ addMessage, message, handleInputChange, isLoading }}
    >
      {children}
    </ChatContext.Provider>
  )
}
