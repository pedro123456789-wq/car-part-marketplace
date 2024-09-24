import { type NextRequest } from 'next/server'
import { updateSession } from './app/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - paths starting with _next/static (static files)
     * - paths starting with _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - image files
     * - api routes
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}