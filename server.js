import express from 'express';
//import data from './data.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedRouter from './routes/seedRoutes.js';
import productRouter from './routes/productRoutes.js';
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import uploadRouter from './routes/uploadRoutes.js';
import categoryRouter from "./routes/categoryRoutes.js";


// import { createServer } from "http";
// import { Server } from "socket.io";

// const httpServer = createServer();
// const io = new Server(httpServer, {
//   // ...
// });

import http from 'http';
import { Server } from 'socket.io';

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log('connected to db');
  })
  .catch((err) => {
    console.log(err.message);
  });


const server = http.createServer(app);
const io = new Server(server);



app.get('/api/keys/google', (req, res) => {
  res.send({ key: process.env.GOOGLE_API_KEY || '' });
});

app.use('/api/upload', uploadRouter);
app.use('/api/seed', seedRouter);
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);
app.use("/api/categories", categoryRouter);

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

io.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  io.emit('reconnection', { status: 'reconnected' });
  socket.on('ping', (data) => {
    console.log('🔥: ping', data);
    // socket.emit('pong', {data, by:'mehdi'});
  });

  socket.on('disconnect', () => {
    socket.disconnect();
    console.log('🔥: A user disconnected');
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`serve at http://localhost:${port}`);
});
