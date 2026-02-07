import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { io } from "socket.io-client";
import { API_URL, SOCKET_URL } from "../config";

let socket;

function Dashboard() {
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [messagesCount, setMessagesCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return navigate("/login");

    const fetchUser = async () => {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data);
    };

    const fetchFriends = async () => {
      const res = await fetch(`${API_URL}/api/friend`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFriends(data);
    };

    const fetchRequests = async () => {
      const res = await fetch(`${API_URL}/api/friend/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRequestsCount(data.length || 0);
    };

    const fetchMessagesCount = async () => {
      const res = await fetch(`${API_URL}/api/message/unread`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessagesCount(data.count || 0);
      }
    };

    fetchUser();
    fetchFriends();
    fetchRequests();
    fetchMessagesCount();

    socket = io(SOCKET_URL);
    socket.emit("join", JSON.parse(localStorage.getItem("user"))._id);

    socket.on("newFriendRequest", fetchRequests);
    socket.on("friendAccepted", fetchFriends);
    socket.on("receiveMessage", fetchMessagesCount);

    return () => socket.disconnect();
  }, [navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: "900px", margin: "20px auto", fontFamily: "sans-serif" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", padding: "10px 20px", background: "#1e1e1e", color: "white", borderRadius: "8px" }}>
        <h2>THAVAKAI</h2>
        <div>
          <Link to="/dashboard" style={{ marginRight: "15px", color: "white", textDecoration: "none" }}>Dashboard</Link>
          <Link to="/friends" style={{ marginRight: "15px", color: "white", textDecoration: "none" }}>Friends ({friends.length})</Link>
          <Link to="/friend-requests" style={{ marginRight: "15px", color: "white", textDecoration: "none" }}>Requests ({requestsCount})</Link>
          <Link to="/chat" style={{ marginRight: "15px", color: "white", textDecoration: "none" }}>Chat ({messagesCount})</Link>
          <Link to="/profile" style={{ marginRight: "15px", color: "white", textDecoration: "none" }}>Profile</Link>
          <button onClick={handleLogout} style={{ padding: "5px 10px" }}>Logout</button>
        </div>
      </nav>

      <div style={{ marginTop: "20px", padding: "20px", background: "#f4f4f4", borderRadius: "8px", textAlign: "center" }}>
        <h3>Welcome, {user.username}!</h3>
        <p>Email: {user.email}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginTop: "30px" }}>
        <div style={{ padding: "20px", background: "#dfe6e9", borderRadius: "8px", textAlign: "center" }}>
          <h4>Messages</h4>
          <p>{messagesCount}</p>
        </div>
        <div style={{ padding: "20px", background: "#ffeaa7", borderRadius: "8px", textAlign: "center" }}>
          <h4>Friends</h4>
          <p>{friends.length}</p>
        </div>
        <div style={{ padding: "20px", background: "#fab1a0", borderRadius: "8px", textAlign: "center" }}>
          <h4>Requests</h4>
          <p>{requestsCount}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
