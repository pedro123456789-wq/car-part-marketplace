import { createBackEndClient } from './server';
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase =  createBackEndClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  //if user tries to access login protected page (non-public page) and is not logged in, 
  //redirect them to the log-in page
  const publicUrls = ["/", "/logIn", "/signIn", "/api/files/download", "/api/auth/create-user"];
  if (
    (!user || error) &&
    !publicUrls.includes(request.nextUrl.pathname)
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = '/logIn'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}