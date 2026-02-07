// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config(); // Load environment variables

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const friendRoutes = require("./routes/friend");
const messageRoutes = require("./routes/message");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/friend", friendRoutes);
app.use("/api/message", messageRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Basic test route
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// ----------- SOCKET.IO -----------
const io = new Server(server, { cors: { origin: "*" } });
let onlineUsers = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Save userId with socket
  socket.on("join", (userId) => {
    onlineUsers[userId] = socket.id;
  });

  // Friend request events
  socket.on("friendRequestSent", ({ recipientId }) => {
    const recipientSocket = onlineUsers[recipientId];
    if (recipientSocket) io.to(recipientSocket).emit("newFriendRequest");
  });

  socket.on("friendAccepted", ({ userId }) => {
    const userSocket = onlineUsers[userId];
    if (userSocket) io.to(userSocket).emit("friendAccepted");
  });

  // Message events
  socket.on("sendMessage", ({ senderId, recipientId, text }) => {
    const recipientSocket = onlineUsers[recipientId];
    if (recipientSocket) io.to(recipientSocket).emit("receiveMessage", { senderId, text });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (let key in onlineUsers) {
      if (onlineUsers[key] === socket.id) delete onlineUsers[key];
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with Socket.IO 🚀`);
});
