const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Message = require('./models/messageModel');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
  });

app.use('/api', require('./routes/userRoutes'));
app.use('/api/gigs', require('./routes/gigRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  socket.on('join_gig_chat', (gigId) => {
    socket.join(gigId);
    console.log(`User ${socket.id} joined gig chat: ${gigId}`);
  });
  socket.on('send_message', async (data) => {
    const { sender, recipient, gig, content } = data;
    const newMessage = new Message({ sender, recipient, gig, content });
    await newMessage.save();
    io.to(gig).emit('receive_message', newMessage);
  });
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.get('/', (req, res) => {
  res.send('Hello from the GigConnect Backend!');
});

httpServer.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});