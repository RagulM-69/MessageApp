// src/pages/Chat.jsx
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

let socket;

function Chat() {
  const token = localStorage.getItem("token");
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    // Fetch accepted friends
    const fetchFriends = async () => {
      const res = await fetch("http://localhost:5000/api/friend/accepted", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFriends(data);
    };

    fetchFriends();

    // Initialize Socket.IO
    socket = io("http://localhost:5000");
    const user = JSON.parse(localStorage.getItem("user"));
    socket.emit("join", user._id);

    // Listen for incoming messages
    socket.on("receiveMessage", ({ senderId, text }) => {
      if (selectedFriend && senderId === selectedFriend._id) {
        setMessages((prev) => [...prev, { senderId, text }]);
      }
    });

    return () => socket.disconnect();
  }, [token, selectedFriend]);

  // Send message
  const handleSend = async () => {
    if (!newMessage || !selectedFriend) return;

    const user = JSON.parse(localStorage.getItem("user"));
    socket.emit("sendMessage", {
      senderId: user._id,
      recipientId: selectedFriend._id,
      text: newMessage,
    });

    await fetch("http://localhost:5000/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ recipientId: selectedFriend._id, text: newMessage }),
    });

    setMessages((prev) => [...prev, { senderId: user._id, text: newMessage }]);
    setNewMessage("");
  };

  return (
    <div style={{ display: "flex", maxWidth: "900px", margin: "20px auto", fontFamily: "sans-serif" }}>
      {/* Friends List */}
      <div style={{ width: "200px", borderRight: "1px solid #ccc", padding: "10px" }}>
        <h3>Friends</h3>
        {friends.length === 0 ? (
          <p>No friends yet</p>
        ) : (
          friends.map((friend) => (
            <div
              key={friend._id}
              onClick={() => {
                setSelectedFriend(friend);
                setMessages([]); // Clear messages for new friend
              }}
              style={{
                padding: "5px",
                cursor: "pointer",
                backgroundColor: selectedFriend?._id === friend._id ? "#dfe6e9" : "transparent",
                borderRadius: "5px",
                marginBottom: "5px",
              }}
            >
              {friend.username}
            </div>
          ))
        )}
      </div>

      {/* Chat Window */}
      <div style={{ flex: 1, padding: "10px" }}>
        {selectedFriend ? (
          <>
            <h3>Chat with {selectedFriend.username}</h3>
            <div
              style={{
                height: "400px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                padding: "10px",
                overflowY: "scroll",
                marginBottom: "10px",
              }}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    textAlign: msg.senderId === selectedFriend._id ? "left" : "right",
                    marginBottom: "5px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "5px 10px",
                      borderRadius: "10px",
                      backgroundColor: msg.senderId === selectedFriend._id ? "#dfe6e9" : "#74b9ff",
                      color: msg.senderId === selectedFriend._id ? "black" : "white",
                    }}
                  >
                    {msg.text}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{ flex: 1, padding: "5px" }}
              />
              <button onClick={handleSend} style={{ padding: "5px 10px" }}>
                Send
              </button>
            </div>
          </>
        ) : (
          <p>Select a friend to start chat</p>
        )}
      </div>
    </div>
  );
}

export default Chat;
