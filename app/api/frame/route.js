import { NextResponse } from "next/server";

const BASE_URL = "https://unloop-mini.vercel.app"; // 🔹 kendi domain’in
const API_KEY = process.env.NEYNAR_API_KEY!;       // 🔹 Vercel Environment'da var

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const fid = body?.untrustedData?.fid || "19267";

    // Kullanıcı verisini Neynar API’den çekiyoruz
    const res = await fetch(`https://api.neynar.com/v2/farcaster/user?fid=${fid}`, {
      headers: {
        accept: "application/json",
        api_key: API_KEY,
      },
    });

    const data = await res.json();
    const user = data.result?.user;

    // Kullanıcıyı bulamadıysa varsayılan görüntü
    if (!user) {
      return NextResponse.json({
        frame: {
          version: "vNext",
          image: `${BASE_URL}/frame-images/not-found.png`,
          post_url: `${BASE_URL}/api/frame`,
          buttons: [{ label: "Try Again" }],
        },
      });
    }

    // Başarılı sonuç
    return NextResponse.json({
      frame: {
        version: "vNext",
        image: `${BASE_URL}/frame-images/active.png`,
        post_url: `${BASE_URL}/api/frame`,
        buttons: [
          { label: "Check Another User", action: "post" },
          {
            label: `View ${user.username} on Warpcast`,
            action: "link",
            target: `https://warpcast.com/${user.username}`,
          },
        ],
      },
    });
  } catch (error) {
    console.error("Frame error:", error);
    return NextResponse.json({
      frame: {
        version: "vNext",
        image: `${BASE_URL}/frame-images/error.png`,
        buttons: [{ label: "Retry" }],
      },
    });
  }
}

