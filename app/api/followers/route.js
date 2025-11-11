import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');
  const cursor = searchParams.get('cursor') || '';

  const API_KEY = process.env.NEYNAR_API_KEY;

  const res = await fetch(`https://api.neynar.com/v2/farcaster/followers?fid=${fid}${cursor ? `&cursor=${cursor}` : ''}`, {
    headers: {
      accept: 'application/json',
      api_key: API_KEY
    }
  });

  const data = await res.json();

  // Dönüş formatı, frontend’in beklediğiyle uyumlu
  return NextResponse.json({
    followers: data.users || [],
    next: data.next || null
  });
}
