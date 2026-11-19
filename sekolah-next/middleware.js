import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/jwt';

export async function middleware(req) {
  const user = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!user) return NextResponse.redirect(new URL('/login', req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/|uploads/|login|logout|favicon\\.ico|.*\\.(?:png|jpg|jpeg|JPG|svg|gif|webp|ico)$).*)'],
};
