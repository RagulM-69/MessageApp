// src/pages/FriendRequests.jsx
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

let socket;

function FriendRequests() {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!token) return;

    // Connect to Socket.IO
    socket = io("http://localhost:5000");
    socket.emit("join", user._id);

    // Fetch pending requests
    const fetchRequests = async () => {
      const res = await fetch("http://localhost:5000/api/friend/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRequests(data);
    };

    fetchRequests();

    // Listen for new requests in real-time
    socket.on("newFriendRequest", fetchRequests);

    // Listen for accepted requests (update list)
    socket.on("friendAccepted", fetchRequests);

    return () => socket.disconnect();
  }, [token, user._id]);

  const acceptRequest = async (requestId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/friend/accept/${requestId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("Friend request accepted!");
        socket.emit("friendAccepted", { userId: user._id });
        // Refresh requests list
        setRequests(prev => prev.filter(r => r._id !== requestId));
      }
    } catch (err) {
      console.error(err);
      alert("Error accepting request");
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "50px auto", fontFamily: "sans-serif" }}>
      <h2>Pending Friend Requests</h2>
      {requests.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        <ul>
          {requests.map(r => (
            <li key={r._id} style={{ margin: "10px 0" }}>
              {r.requester.username} ({r.requester.email})
              <button
                onClick={() => acceptRequest(r._id)}
                style={{ marginLeft: "10px" }}
              >
                Accept
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FriendRequests;
