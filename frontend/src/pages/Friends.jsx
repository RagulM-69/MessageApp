// src/pages/Friends.jsx
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

let socket;

function Friends() {
  const [friends, setFriends] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!token) return;

    socket = io("http://localhost:5000");
    socket.emit("join", user._id);

    // Fetch all users (except self)
    const fetchAllUsers = async () => {
      const res = await fetch("http://localhost:5000/api/user/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAllUsers(data.filter(u => u._id !== user._id));
    };

    // Fetch current friends
    const fetchFriends = async () => {
      const res = await fetch("http://localhost:5000/api/friend", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFriends(data);
    };

    fetchAllUsers();
    fetchFriends();

    socket.on("friendAccepted", fetchFriends);

    return () => socket.disconnect();
  }, [token, user._id]);

  const sendFriendRequest = async (recipientId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/friend/request/${recipientId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("Friend request sent!");
        socket.emit("friendRequestSent", { recipientId });
      }
    } catch (err) {
      console.error(err);
      alert("Error sending request");
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "50px auto", fontFamily: "sans-serif" }}>
      <h2>Friends</h2>

      <div style={{ marginTop: "20px" }}>
        <h3>All Users</h3>
        {allUsers.length === 0 && <p>No users found.</p>}
        <ul>
          {allUsers.map(u => (
            <li key={u._id} style={{ margin: "10px 0" }}>
              {u.username} ({u.email})
              <button
                onClick={() => sendFriendRequest(u._id)}
                style={{ marginLeft: "10px" }}
              >
                Add Friend
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: "40px" }}>
        <h3>Your Friends</h3>
        {friends.length === 0 && <p>You have no friends yet.</p>}
        <ul>
          {friends.map(f => (
            <li key={f._id}>
              {f.requester._id === user._id ? f.recipient.username : f.requester.username}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Friends;
