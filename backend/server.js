// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

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

// MongoDB
mongoose
  .connect(
    "mongodb+srv://Ragul:Zbu3GXcHJnzOEsqa@kuvacluster.ugytzfa.mongodb.net/thavakai"
  )
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// ----------- SOCKET.IO -----------
const io = new Server(server, { cors: { origin: "*" } });

// Keep track of online users
let onlineUsers = {};

io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  // Save userId with socket
  socket.on("join", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log("Online Users:", onlineUsers);
  });

  // Friend request sent
  socket.on("friendRequestSent", ({ recipientId }) => {
    const recipientSocket = onlineUsers[recipientId];
    if (recipientSocket) io.to(recipientSocket).emit("newFriendRequest");
  });

  // Friend request accepted
  socket.on("friendAccepted", ({ userId }) => {
    const userSocket = onlineUsers[userId];
    if (userSocket) io.to(userSocket).emit("friendAccepted");
  });

  // Sending a chat message
  socket.on("sendMessage", async ({ senderId, recipientId, text }) => {
    const recipientSocket = onlineUsers[recipientId];

    // Save message in DB
    const Message = require("./models/Message");
    try {
      const message = await Message.create({ sender: senderId, recipient: recipientId, text });
      console.log("Message saved:", message);
    } catch (err) {
      console.error("Message save error:", err.message);
    }

    // Emit real-time message
    if (recipientSocket) {
      io.to(recipientSocket).emit("receiveMessage", { senderId, text });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
    for (let key in onlineUsers) {
      if (onlineUsers[key] === socket.id) delete onlineUsers[key];
    }
  });
});

// Start server
server.listen(5000, () => {
  console.log("Server running on port 5000 with Socket.IO 🚀");
});
