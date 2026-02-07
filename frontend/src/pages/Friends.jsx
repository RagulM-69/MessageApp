import React, { useEffect, useState } from "react";
import { API_URL } from "../config";

function Friends() {
  const [friends, setFriends] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchFriends = async () => {
      const res = await fetch(`${API_URL}/api/friend`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFriends(data);
    };
    fetchFriends();
  }, [token]);

  return (
    <div style={{ maxWidth: "700px", margin: "20px auto", fontFamily: "sans-serif" }}>
      <h2>Friends List</h2>
      {friends.length === 0 ? (
        <p>No friends yet</p>
      ) : (
        <ul>
          {friends.map((friend) => (
            <li key={friend._id}>
              {friend.username} ({friend.email})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Friends;
