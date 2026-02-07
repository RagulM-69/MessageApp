import React, { useEffect, useState } from "react";
import { API_URL, SOCKET_URL } from "../config";
import { io } from "socket.io-client";

let socket;

function Chat() {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const token = localStorage.getItem("token");
  const userId = JSON.parse(localStorage.getItem("user"))?._id;

  useEffect(() => {
    const fetchFriends = async () => {
      const res = await fetch(`${API_URL}/api/friend`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFriends(data);
    };

    fetchFriends();

    socket = io(SOCKET_URL);
    socket.emit("join", userId);

    socket.on("receiveMessage", ({ senderId, text }) => {
      if (selectedFriend && senderId === selectedFriend._id) {
        setMessages((prev) => [...prev, { senderId, text }]);
      }
    });

    return () => socket.disconnect();
  }, [token, userId, selectedFriend]);

  const fetchMessages = async (friendId) => {
    setSelectedFriend(friends.find((f) => f._id === friendId));
    const res = await fetch(`${API_URL}/api/message/${friendId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessages(data);
  };

  const handleSend = async () => {
    if (!newMessage || !selectedFriend) return;
    socket.emit("sendMessage", { senderId: userId, recipientId: selectedFriend._id, text: newMessage });
    setMessages((prev) => [...prev, { senderId: userId, text: newMessage }]);
    setNewMessage("");
  };

  return (
    <div style={{ maxWidth: "900px", margin: "20px auto", fontFamily: "sans-serif", display: "flex", gap: "20px" }}>
      <div style={{ flex: 1 }}>
        <h3>Friends</h3>
        {friends.length === 0 ? (
          <p>No friends yet</p>
        ) : (
          <ul>
            {friends.map((friend) => (
              <li
                key={friend._id}
                onClick={() => fetchMessages(friend._id)}
                style={{ cursor: "pointer", margin: "5px 0" }}
              >
                {friend.username}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ flex: 2, border: "1px solid #ccc", padding: "10px", borderRadius: "8px" }}>
        <h3>Chat</h3>
        {selectedFriend ? (
          <>
            <div style={{ minHeight: "300px", maxHeight: "400px", overflowY: "auto", marginBottom: "10px" }}>
              {messages.map((msg, idx) => (
                <p key={idx} style={{ textAlign: msg.senderId === userId ? "right" : "left" }}>
                  <strong>{msg.senderId === userId ? "You" : selectedFriend.username}:</strong> {msg.text}
                </p>
              ))}
            </div>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message"
              style={{ width: "80%", padding: "5px" }}
            />
            <button onClick={handleSend} style={{ padding: "5px 10px", marginLeft: "5px" }}>Send</button>
          </>
        ) : (
          <p>Select a friend to start chat</p>
        )}
      </div>
    </div>
  );
}

export default Chat;
