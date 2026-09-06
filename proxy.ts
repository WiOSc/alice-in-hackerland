import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export default async function proxy(req: NextRequest) {
  const session = req.cookies.get('session')?.value;
  if (!session) return NextResponse.redirect(new URL('/login', req.url));

  try {
    const decoded = await adminAuth.verifySessionCookie(session);
    if (decoded.role !== 'team' && decoded.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*'] };