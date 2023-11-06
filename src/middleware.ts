import { authMiddleware } from '@kinde-oss/kinde-auth-nextjs/dist/server'

export const config = {
  matcher: ['/dashboard/:Patj*', '/auth-callback'],
}

export default authMiddleware
