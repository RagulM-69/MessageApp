import React, { useEffect, useState } from "react";
import { API_URL, SOCKET_URL } from "../config";
import { io } from "socket.io-client";

let socket;

function FriendRequests() {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRequests = async () => {
      const res = await fetch(`${API_URL}/api/friend/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRequests(data);
    };

    fetchRequests();

    socket = io(SOCKET_URL);
    socket.emit("join", JSON.parse(localStorage.getItem("user"))._id);
    socket.on("newFriendRequest", fetchRequests);

    return () => socket.disconnect();
  }, [token]);

  const handleAccept = async (requestId) => {
    await fetch(`${API_URL}/api/friend/accept/${requestId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setRequests(requests.filter((req) => req._id !== requestId));
  };

  return (
    <div style={{ maxWidth: "700px", margin: "20px auto", fontFamily: "sans-serif" }}>
      <h2>Friend Requests</h2>
      {requests.length === 0 ? (
        <p>No friend requests</p>
      ) : (
        <ul>
          {requests.map((req) => (
            <li key={req._id}>
              {req.sender.username} ({req.sender.email})
              <button
                onClick={() => handleAccept(req._id)}
                style={{ marginLeft: "10px", padding: "5px 10px" }}
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
