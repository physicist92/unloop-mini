'use client';

import { useState, useEffect } from "react";
import { miniApp } from "@farcaster/miniapp-sdk";  // ✅ DOĞRU IMPORT

export default function Home() {
    const [ready, setReady] = useState(false);
    const [fid, setFid] = useState("");
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ followers: 0, following: 0 });
    const [notFollowingBack, setNotFollowingBack] = useState([]);
    const [theyDontFollow, setTheyDontFollow] = useState([]);

    // ------------------------------------------------
    // MINI APP INITIALIZATION
    // ------------------------------------------------
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            console.log("🔄 Initializing Mini App...");

            miniApp.actions.ready();   // ✅ DOĞRU KULLANIM

            console.log("✅ Mini App ready sent!");
            setReady(true);
        } catch (err) {
            console.error("❌ Mini App init failed:", err);
        }
    }, []);

    // ------------------------------------------------
    // FETCH FUNCTIONS
    // ------------------------------------------------
    const fetchAllPages = async (endpoint, fid) => {
        let allUsers = [];
        let cursor = null;

        try {
            while (true) {
                const url = new URL(
                    `/api/${endpoint}?fid=${fid}${cursor ? `&cursor=${cursor}` : ""}`,
                    window.location.origin
                );
                const res = await fetch(url);
                const data = await res.json();

                const users = (data[endpoint] || data.result?.users || []).map((item) => {
                    const u = item.user || item;
                    return {
                        fid: u.fid,
                        username: u.username,
                        display_name: u.display_name,
                        pfp_url: u.pfp_url,
                    };
                });

                allUsers = [...allUsers, ...users];
                if (!data.next?.cursor) break;
                cursor = data.next.cursor;
            }
        } catch (err) {
            console.error(`Error fetching ${endpoint}:`, err);
        }

        return allUsers;
    };

    // ------------------------------------------------
    // CHECK DATA
    // ------------------------------------------------
    const checkData = async () => {
        if (!fid) return alert("Please enter your FID!");

        setLoading(true);

        const [followers, following] = await Promise.all([
            fetchAllPages("followers", fid),
            fetchAllPages("following", fid),
        ]);

        const followerIds = followers.map((u) => u.fid);
        const followingIds = following.map((u) => u.fid);

        setStats({
            followers: followers.length,
            following: following.length,
        });

        setNotFollowingBack(
            following.filter((u) => !followerIds.includes(u.fid))
        );

        setTheyDontFollow(
            followers.filter((u) => !followingIds.includes(u.fid))
        );

        setLoading(false);
    };

    // ------------------------------------------------
    // UI
    // ------------------------------------------------
    return (
        <div className="p-6 max-w-5xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-purple-700">
                Farcaster Unloop Mini App
            </h1>

            {!ready ? (
                <p className="text-gray-500 animate-pulse">
                    Initializing Mini App SDK ⏳
                </p>
            ) : (
                <p className="text-green-600">
                    ✅ Mini App SDK initialized!
                </p>
            )}

            <div className="flex justify-center mt-4">
                <input
                    value={fid}
                    onChange={(e) => setFid(e.target.value)}
                    placeholder="Enter your FID"
                    className="border p-2 rounded-lg w-60"
                />
                <button
                    onClick={checkData}
                    className="ml-2 bg-purple-600 text-white px-4 py-2 rounded-lg"
                >
                    Check
                </button>
            </div>

            {loading && <p className="mt-3 animate-pulse text-gray-400">Fetching...</p>}

            {!loading && stats.followers > 0 && (
                <div className="mt-6">
                    <p>
                        👥 Followers: <b>{stats.followers}</b> | ➡️ Following:{" "}
                        <b>{stats.following}</b>
                    </p>
                </div>
            )}
        </div>
    );
}
