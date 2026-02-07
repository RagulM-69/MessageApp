import React, { useEffect, useState } from "react";
import { API_URL } from "../config";

function Profile() {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data);
    };
    fetchUser();
  }, [token]);

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: "700px", margin: "20px auto", fontFamily: "sans-serif" }}>
      <h2>Profile</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
    </div>
  );
}

export default Profile;
