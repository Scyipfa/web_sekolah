import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req, { params }) {
  const { name } = await params;
  const sql = await db();
  const [f] = await sql`SELECT mime, data FROM tbl_file WHERE name = ${name}`;
  if (!f) return NextResponse.redirect(new URL('/avatar.svg', req.url));
  return new Response(f.data, {
    headers: {
      'Content-Type': f.mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'",
    },
  });
}
