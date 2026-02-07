// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { io } from "socket.io-client";

let socket;

function Dashboard() {
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [messagesCount, setMessagesCount] = useState(0);
  const [newFriendId, setNewFriendId] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ---------------- Fetch Data ----------------
  useEffect(() => {
    if (!token) return navigate("/login");

    const storedUser = JSON.parse(localStorage.getItem("user"));

    // Fetch user info
    const fetchUser = async () => {
      const res = await fetch("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data);
    };

    // Fetch friends
    const fetchFriends = async () => {
      const res = await fetch("http://localhost:5000/api/friend", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFriends(data);
    };

    // Fetch pending requests
    const fetchRequests = async () => {
      const res = await fetch("http://localhost:5000/api/friend/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRequests(data);
    };

    // Fetch unread messages count
    const fetchMessagesCount = async () => {
      const res = await fetch("http://localhost:5000/api/message/unread", {
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

    // ---------------- Socket.IO ----------------
    socket = io("http://localhost:5000");
    socket.emit("join", storedUser._id);

    socket.on("newFriendRequest", fetchRequests);
    socket.on("friendAccepted", fetchFriends);
    socket.on("receiveMessage", fetchMessagesCount);

    return () => socket.disconnect();
  }, [navigate, token]);

  // ---------------- Logout ----------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ---------------- Send Friend Request ----------------
  const handleSendRequest = async () => {
    if (!newFriendId) return alert("Enter recipient ID");
    try {
      const res = await fetch("http://localhost:5000/api/friend/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId: newFriendId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        socket.emit("friendRequestSent", { recipientId: newFriendId });
        setNewFriendId("");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error sending request");
    }
  };

  // ---------------- Accept Friend Request ----------------
  const handleAcceptRequest = async (requestId, requesterId) => {
    try {
      const res = await fetch("http://localhost:5000/api/friend/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        socket.emit("friendAccepted", { userId: requesterId });
        // Refresh requests and friends
        const fetchFriends = await fetch("http://localhost:5000/api/friend", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriends(await fetchFriends.json());
        const fetchReq = await fetch("http://localhost:5000/api/friend/requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(await fetchReq.json());
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error accepting request");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: "900px", margin: "20px auto", fontFamily: "sans-serif" }}>
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 20px",
          background: "#1e1e1e",
          color: "white",
          borderRadius: "8px",
        }}
      >
        <h2>THAVAKAI</h2>
        <div>
          <Link to="/dashboard" style={{ marginRight: "15px", color: "white", textDecoration: "none" }}>
            Dashboard
          </Link>
          <Link to="/friends" style={{ marginRight: "15px", color: "white", textDecoration: "none" }}>
            Friends ({friends.length})
          </Link>
          <Link to="/friend-requests" style={{ marginRight: "15px", color: "white", textDecoration: "none" }}>
            Requests ({requests.length})
          </Link>
          <Link to="/chat" style={{ marginRight: "15px", color: "white", textDecoration: "none" }}>
            Chat ({messagesCount})
          </Link>
          <Link to="/profile" style={{ marginRight: "15px", color: "white", textDecoration: "none" }}>
            Profile
          </Link>
          <button onClick={handleLogout} style={{ padding: "5px 10px" }}>
            Logout
          </button>
        </div>
      </nav>

      {/* Welcome Card */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          background: "#f4f4f4",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <h3>Welcome, {user.username}!</h3>
        <p>Email: {user.email}</p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "20px",
          marginTop: "30px",
        }}
      >
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
          <p>{requests.length}</p>
        </div>
      </div>

      {/* Friend Request Section */}
      <div style={{ marginTop: "30px", padding: "20px", background: "#dfe6e9", borderRadius: "8px" }}>
        <h4>Send Friend Request</h4>
        <input
          type="text"
          placeholder="Recipient User ID"
          value={newFriendId}
          onChange={(e) => setNewFriendId(e.target.value)}
          style={{ padding: "8px", width: "300px", marginRight: "10px" }}
        />
        <button onClick={handleSendRequest} style={{ padding: "8px 12px" }}>
          Send
        </button>
      </div>

      {/* Pending Requests */}
      <div style={{ marginTop: "20px", padding: "20px", background: "#ffeaa7", borderRadius: "8px" }}>
        <h4>Pending Friend Requests</h4>
        {requests.length === 0 && <p>No pending requests</p>}
        {requests.map((req) => (
          <div
            key={req._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px",
              background: "#fff",
              marginBottom: "8px",
              borderRadius: "4px",
            }}
          >
            <span>{req.requester.username} ({req.requester.email})</span>
            <button onClick={() => handleAcceptRequest(req._id, req.requester._id)} style={{ padding: "5px 10px" }}>
              Accept
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
