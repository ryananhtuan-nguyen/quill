import { router } from './trpc'
const appRouter = router({
  // ...
})
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter
