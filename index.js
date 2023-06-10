const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = express();
const jwt = require('jsonwebtoken');
const http = require('http');
const dns = require('dns');
const DB = process.env.MONGO_URI;
const cors = require('cors');
const { Server } = require('socket.io');
const Domain = require('./models/clientModel');
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log('DB connection successful!'));
const signToken = (domainName) => {
  return jwt.sign({ domainName }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});

io.on('connection', (socket) => {
  socket.on('sendHtmlPopup', (string) => {
    console.log('message from client 1', string);
    socket.broadcast.emit('receiveMessage', string);
  });
});
io.on('connection', (socket) => {
  socket.on('sendTokenAndDomain', (res) => {
    console.log(res);
  });
});
io.on('connection', (socket) => {
  socket.on('sendDomainName', async (domain) => {
    try {
      console.log(domain);
      const existingDomain = await Domain.findOne({ domainName: domain });
      await new Promise((resolve, reject) => {
        dns.lookup(domain, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      if (existingDomain) {
        socket.emit('verificationResult', {
          success: false,
          message: 'Domain already exists in the database.',
        });
      } else {
        const newDomain = new Domain({ domainName: domain });
        const token = signToken(domain);
        await newDomain.save();
        socket.emit('verificationResult', {
          token: token,
          success: true,
          message: 'Domain verified and added to the database.',
        });
      }
    } catch (error) {
      socket.emit('verificationResult', {
        success: false,
        message: 'Domain verification failed.',
      });
    }
  });
});
server.listen(3001, () => {
  console.log('SERVER RUNNING');
});
