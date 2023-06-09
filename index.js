const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

io.on("connection", (socket) => {
  socket.on("sendHtmlPopup", (string) =>
  {
    console.log("message from client 1",string)
    socket.broadcast.emit('receiveMessage', string);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});
