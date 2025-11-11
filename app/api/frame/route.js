import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    frames: [
      {
        version: "vNext",
        name: "Farcaster Unloop Tracker",
        iconUrl: "https://warpcast.com/_next/image?url=%2Fimages%2Ffavicon.png&w=32&q=75",
        homeUrl: "https://YOUR-DEPLOYED-APP.vercel.app", // kendi linkin buraya
        description: "Track who unfollowed or followed you back on Farcaster 👀",
        splashImageUrl: "https://YOUR-DEPLOYED-APP.vercel.app/og-image.png",
        splashBackgroundColor: "#faf5ff",
        primaryColor: "#9333ea",
        actions: [
          {
            label: "Open Tracker",
            action: {
              type: "launch_frame",
              url: "https://YOUR-DEPLOYED-APP.vercel.app",
            },
          },
        ],
      },
    ],
  });
}

