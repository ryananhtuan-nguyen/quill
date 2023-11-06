import { db } from '@/db'
import { openai } from '@/libs/openai'
import { pinecone } from '@/libs/pinecone'
import { SendMessageValidator } from '@/libs/validators/SendMessageValidator'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/dist/server'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { NextRequest } from 'next/server'
import { OpenAIStream, StreamingTextResponse } from 'ai'

export const POST = async (req: NextRequest) => {
  //endpoint for asking a question to a pdf file

  //get body of the request and current user
  const body = await req.json()
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  //validate user
  const { id: userId } = user
  if (!userId) return new Response('UNAUTHORIZE', { status: 401 })

  //validate input / questions
  const { fileId, message } = SendMessageValidator.parse(body)

  //validate file in db
  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  })
  //if theres no file throw error not found
  if (!file) return new Response('Not found', { status: 404 })

  //create the message in db
  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  })

  // todo : AI
  //1:vectorize message
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPEN_API_KEY,
  })

  const pineconeIndex = pinecone.Index('quill')
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
  })

  const results = await vectorStore.similaritySearch(message, 4)

  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: 6,
  })

  const formattedPrevMessages = prevMessages.map((msg) => ({
    role: msg.isUserMessage ? ('user' as const) : ('assistant' as const),
    content: msg.text,
  }))

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    temperature: 0,
    stream: true,
    messages: [
      {
        role: 'system',
        content:
          'Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.',
      },
      {
        role: 'user',
        content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
  \n----------------\n
  
  PREVIOUS CONVERSATION:
  ${formattedPrevMessages.map((message) => {
    if (message.role === 'user') return `User: ${message.content}\n`
    return `Assistant: ${message.content}\n`
  })}
  
  \n----------------\n
  
  CONTEXT:
  ${results.map((r) => r.pageContent).join('\n\n')}
  
  USER INPUT: ${message}`,
      },
    ],
  })

  const stream = OpenAIStream(response, {
    async onCompletion(completions) {
      await db.message.create({
        data: {
          text: completions,
          isUserMessage: false,
          fileId,
          userId,
        },
      })
    },
  })

  return new StreamingTextResponse(stream)
}
