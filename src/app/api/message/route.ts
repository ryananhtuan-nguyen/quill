import { db } from '@/db'
import { SendMessageValidator } from '@/libs/validators/SendMessageValidator'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/dist/server'
import { NextRequest } from 'next/server'

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
}
