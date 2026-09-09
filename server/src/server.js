import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

import gameSocket from "./socket/gameSocket.js";


const app = express();


// =====================================================
// CORS
// =====================================================
//
// Cho phép frontend Vite chạy ở 5173 hoặc 5174.
//
// Khi Vite đổi port do 5173 đang được sử dụng,
// frontend vẫn có thể kết nối Socket.IO.
//

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174"
];


app.use(
    cors({
        origin: allowedOrigins,
        credentials: true
    })
);


app.use(express.json());


// =====================================================
// TEST API
// =====================================================

app.get("/", (req, res) => {

    res.json({
        message:
            "Werewolf Server is running"
    });

});


// =====================================================
// HTTP SERVER
// =====================================================

const server =
    http.createServer(app);


// =====================================================
// SOCKET.IO
// =====================================================

const io = new Server(server, {

    cors: {

        origin: allowedOrigins,

        methods: [
            "GET",
            "POST"
        ],

        credentials: true

    }

});


// =====================================================
// GAME SOCKET
// =====================================================

gameSocket(io);


// =====================================================
// START SERVER
// =====================================================

const PORT = 5000;

server.listen(
    PORT,
    () => {

        console.log(
            `Server running at http://localhost:${PORT}`
        );

    }
);