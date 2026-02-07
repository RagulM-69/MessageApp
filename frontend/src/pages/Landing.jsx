// src/pages/Landing.jsx
import React from "react";
import { Link } from "react-router-dom";

function Landing() {
  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "100px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        textAlign: "center",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Welcome to THAVAKAI</h1>
      <p>Connect with friends and chat in real-time</p>
      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <Link
          to="/register"
          style={{
            padding: "10px",
            backgroundColor: "#74b9ff",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
          }}
        >
          Sign Up
        </Link>
        <Link
          to="/Login"
          style={{
            padding: "10px",
            backgroundColor: "#00b894",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
          }}
        >
          Login
        </Link>
      </div>
    </div>
  );
}

export default Landing;
