'use client';
import { useEffect, useState } from "react";

export default function Home() {
  const [fid, setFid] = useState('19267');
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [notFollowingBack, setNotFollowingBack] = useState([]);
  const [theyDontFollow, setTheyDontFollow] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  // ✅ Farcaster Frame SDK - delayed ready()
  useEffect(() => {
    const initFrame = async () => {
      try {
        const { actions } = await import("@farcaster/frame-sdk");

        const handleReady = () => {
          console.log("✅ Farcaster frame loaded, calling actions.ready()");
          actions.ready();
          setReady(true);
        };

        if (document.readyState === "complete") {
          handleReady();
        } else {
          window.addEventListener("load", handleReady);
          return () => window.removeEventListener("load", handleReady);
        }
      } catch (err) {
        console.warn("⚠️ Frame SDK load error:", err);
      }
    };

    if (typeof window !== "undefined") initFrame();
  }, []);

  // ✅ Tüm takipçileri çekme fonksiyonu
  const fetchAllPages = async (endpoint, fid) => {
    let allUsers = [];
    let cursor = null;

    try {
      while (true) {
        const url = new URL(
          `/api/${endpoint}?fid=${fid}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`,
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
        if (data.next?.cursor) cursor = data.next.cursor;
        else break;
      }
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
    }

    return allUsers;
  };

  const checkData = async () => {
    setLoading(true);
    setNotFollowingBack([]);
    setTheyDontFollow([]);

    try {
      const [followers, following] = await Promise.all([
        fetchAllPages('followers', fid),
        fetchAllPages('following', fid),
      ]);

      const followerIds = followers.map((u) => u.fid);
      const followingIds = following.map((u) => u.fid);

      const notFollowingBackList = following.filter((u) => !followerIds.includes(u.fid));
      const theyDontFollowYouList = followers.filter((u) => !followingIds.includes(u.fid));

      setStats({ followers: followers.length, following: following.length });
      setNotFollowingBack(notFollowingBackList);
      setTheyDontFollow(theyDontFollowYouList);
    } catch (e) {
      console.error('Error:', e);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto text-center">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-purple-700">
        Farcaster Unloop Tracker
      </h1>

      {!ready && (
        <p className="text-gray-500 mb-4 animate-pulse">
          Initializing Frame SDK ⏳
        </p>
      )}
      {ready && (
        <p className="text-green-600 mb-4">
          ✅ Frame SDK initialized successfully!
        </p>
      )}

      <div className="flex justify-center mb-4">
        <input
          className="border border-gray-300 p-2 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={fid}
          onChange={(e) => setFid(e.target.value)}
          placeholder="Enter your FID"
        />
        <button
          onClick={checkData}
          className="bg-purple-600 hover:bg-purple-700 transition text-white px-5 py-2 rounded-lg ml-2"
        >
          Check
        </button>
      </div>

      {loading && <p className="text-gray-400 animate-pulse">Fetching data... please wait ⏳</p>}

      {!loading && stats.followers > 0 && (
        <div className="mb-6">
          <p className="text-lg font-medium mb-1">
            👥 Followers: <b>{stats.followers}</b> &nbsp; | &nbsp; ➡️ Following:{' '}
            <b>{stats.following}</b>
          </p>
          <p className="text-gray-600 text-sm">
            🚫 Not following back: {notFollowingBack.length} &nbsp; | &nbsp; 👀 They follow you, but
            you don’t: {theyDontFollow.length}
          </p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* 🚫 Not following back */}
          <div>
            <h2 className="text-xl font-semibold mb-3 text-pink-600 flex items-center">
              🚫 Not following back
            </h2>
            <ul className="space-y-3">
              {notFollowingBack.map((user) => (
                <li
                  key={user.fid}
                  className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition rounded-xl p-2 shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.pfp_url}
                      alt={user.username}
                      className="w-9 h-9 rounded-full border"
                    />
                    <div>
                      <a
                        href={`https://warpcast.com/${user.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                      >
                        {user.display_name || user.username}
                      </a>
                      <p className="text-gray-500 text-sm">@{user.username}</p>
                    </div>
                  </div>
                  <a
                    href={`https://warpcast.com/${user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm px-3 py-1 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
                  >
                    Unfollow
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 👀 They follow you but you don’t */}
          <div>
            <h2 className="text-xl font-semibold mb-3 text-purple-600 flex items-center">
              👀 They follow you, but you don’t
            </h2>
            <ul className="space-y-3">
              {theyDontFollow.map((user) => (
                <li
                  key={user.fid}
                  className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition rounded-xl p-2 shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.pfp_url}
                      alt={user.username}
                      className="w-9 h-9 rounded-full border"
                    />
                    <div>
                      <a
                        href={`https://warpcast.com/${user.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                      >
                        {user.display_name || user.username}
                      </a>
                      <p className="text-gray-500 text-sm">@{user.username}</p>
                    </div>
                  </div>
                  <a
                    href={`https://warpcast.com/${user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                  >
                    Follow
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
