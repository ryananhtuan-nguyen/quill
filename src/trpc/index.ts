import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/dist/server'
import { publicProcedure, router } from './trpc'
import { TRPCError } from '@trpc/server'
import { db } from '@/db'
export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user.id || !user.email) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }
    //check if the user is in database
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    })

    if (!dbUser) {
      //create user in db
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      })
    }

    return { success: true }
  }),
})
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter
