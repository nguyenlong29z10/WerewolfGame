import crypto from "crypto";

import {
    createRoom,
    getRoom,
    deleteRoom,
    getHostRoomState
} from "../services/gameService.js";

import {
    generateRoomCode
} from "../utils/generateRoomCode.js";

import {
    shuffle
} from "../utils/shuffle.js";


// =====================================================
// CREATE TOKEN
// =====================================================

const createToken = () => {

    return crypto
        .randomBytes(16)
        .toString("hex");

};


// =====================================================
// GAME SOCKET
// =====================================================

export default function gameSocket(io) {

    io.on(
        "connection",
        (socket) => {

            console.log(
                "Socket connected:",
                socket.id
            );


            // =================================================
            // CREATE ROOM
            // =================================================

            socket.on(
                "create_room",
                () => {

                    let roomCode;


                    do {

                        roomCode =
                            generateRoomCode();

                    } while (
                        getRoom(roomCode)
                    );


                    const hostToken =
                        createToken();


                    const room =
                        createRoom(
                            roomCode,
                            hostToken
                        );


                    socket.join(
                        roomCode
                    );


                    socket.data.hostRoom =
                        roomCode;

                    socket.data.hostToken =
                        hostToken;


                    socket.emit(
                        "room_created",
                        {
                            roomCode,
                            hostToken
                        }
                    );


                    console.log(
                        `Room created: ${roomCode}`
                    );

                }
            );


            // =================================================
            // HOST RECONNECT
            // =================================================

            socket.on(
                "host_reconnect",
                ({
                    roomCode,
                    hostToken
                }) => {

                    const room =
                        getRoom(roomCode);


                    // -----------------------------
                    // ROOM NOT FOUND
                    // -----------------------------

                    if (!room) {

                        socket.emit(
                            "room_not_found"
                        );

                        return;

                    }


                    // -----------------------------
                    // HOST CHECK
                    // -----------------------------

                    if (
                        room.hostToken !==
                        hostToken
                    ) {

                        socket.emit(
                            "host_unauthorized"
                        );

                        return;

                    }


                    // -----------------------------
                    // JOIN ROOM
                    // -----------------------------

                    socket.join(
                        roomCode
                    );


                    socket.data.hostRoom =
                        roomCode;

                    socket.data.hostToken =
                        hostToken;


                    // -----------------------------
                    // UPDATE ACTIVITY
                    // -----------------------------

                    room.lastActivity =
                        Date.now();


                    // -----------------------------
                    // SEND ROOM STATE
                    // -----------------------------

                    socket.emit(
                        "room_state",
                        getHostRoomState(room)
                    );


                    console.log(
                        `Host reconnected to room: ${roomCode}`
                    );

                }
            );


            // =================================================
            // PLAYER JOIN
            // =================================================

            socket.on(
                "join_player",
                ({
                    roomCode,
                    name
                }) => {

                    const room =
                        getRoom(roomCode);


                    // -----------------------------
                    // ROOM CHECK
                    // -----------------------------

                    if (!room) {

                        socket.emit(
                            "join_error",
                            {
                                message:
                                    "Phòng không tồn tại"
                            }
                        );

                        return;

                    }


                    // -----------------------------
                    // STATUS CHECK
                    // -----------------------------

                    if (
                        room.status !==
                        "WAITING"
                    ) {

                        socket.emit(
                            "join_error",
                            {
                                message:
                                    "Phòng đã bắt đầu"
                            }
                        );

                        return;

                    }


                    // -----------------------------
                    // CLEAN NAME
                    // -----------------------------

                    const cleanName =
                        name.trim();


                    if (!cleanName) {

                        socket.emit(
                            "join_error",
                            {
                                message:
                                    "Vui lòng nhập tên"
                            }
                        );

                        return;

                    }


                    // -----------------------------
                    // DUPLICATE NAME
                    // -----------------------------

                    const duplicate =
                        room.players.some(
                            (player) =>
                                player.name
                                    .toLowerCase() ===
                                cleanName
                                    .toLowerCase()
                        );


                    if (duplicate) {

                        socket.emit(
                            "join_error",
                            {
                                message:
                                    "Tên này đã được sử dụng"
                            }
                        );

                        return;

                    }


                    // -----------------------------
                    // CREATE PLAYER TOKEN
                    // -----------------------------

                    const playerToken =
                        createToken();


                    // -----------------------------
                    // CREATE PLAYER
                    // -----------------------------

                    const player = {

                        id:
                            socket.id,

                        token:
                            playerToken,

                        name:
                            cleanName,

                        role:
                            null

                    };


                    room.players.push(
                        player
                    );


                    room.lastActivity =
                        Date.now();


                    // -----------------------------
                    // JOIN SOCKET ROOM
                    // -----------------------------

                    socket.join(
                        roomCode
                    );


                    socket.data.playerRoom =
                        roomCode;

                    socket.data.playerToken =
                        playerToken;


                    // -----------------------------
                    // PLAYER JOINED
                    // -----------------------------

                    socket.emit(
                        "player_joined",
                        {

                            roomCode,

                            playerToken,

                            player: {
                                name:
                                    player.name
                            }

                        }
                    );


                    // -----------------------------
                    // UPDATE PLAYERS
                    // -----------------------------

                    const players =
                        room.players.map(
                            (player) => ({

                                id:
                                    player.id,

                                name:
                                    player.name

                            })
                        );


                    io.to(roomCode).emit(
                        "players_updated",
                        {
                            players
                        }
                    );


                    console.log(
                        `${cleanName} joined room ${roomCode}`
                    );

                }
            );


            // =================================================
            // START SETUP
            // =================================================

            socket.on(
                "start_setup",
                ({
                    roomCode,
                    hostToken
                }) => {

                    const room =
                        getRoom(roomCode);


                    // -----------------------------
                    // ROOM CHECK
                    // -----------------------------

                    if (!room) {

                        socket.emit(
                            "action_error",
                            {
                                message:
                                    "Phòng không tồn tại"
                            }
                        );

                        return;

                    }


                    // -----------------------------
                    // HOST CHECK
                    // -----------------------------

                    if (
                        room.hostToken !==
                        hostToken
                    ) {

                        socket.emit(
                            "action_error",
                            {
                                message:
                                    "Bạn không phải quản trò"
                            }
                        );

                        return;

                    }


                    // -----------------------------
                    // PLAYER CHECK
                    // -----------------------------

                    if (
                        room.players.length ===
                        0
                    ) {

                        socket.emit(
                            "action_error",
                            {
                                message:
                                    "Chưa có người chơi"
                            }
                        );

                        return;

                    }


                    // -----------------------------
                    // CHANGE STATUS
                    // -----------------------------

                    room.status =
                        "SETUP";


                    room.lastActivity =
                        Date.now();


                    // -----------------------------
                    // GAME STARTED
                    // -----------------------------

                    io.to(roomCode).emit(
                        "game_started",
                        {
                            playerCount:
                                room.players.length
                        }
                    );


                    // -----------------------------
                    // ROOM STATE
                    // -----------------------------

                    socket.emit(
                        "room_state",
                        getHostRoomState(room)
                    );


                    console.log(
                        `Room ${roomCode} entered SETUP with ${room.players.length} players`
                    );

                }
            );


            // =================================================
            // UPDATE ROLES
            // =================================================

            socket.on(
                "update_roles",
                ({
                    roomCode,
                    hostToken,
                    selectedRoles
                }) => {

                    const room =
                        getRoom(roomCode);


                    if (!room) return;


                    if (
                        room.hostToken !==
                        hostToken
                    ) {

                        return;

                    }


                    if (
                        room.status !==
                        "SETUP"
                    ) {

                        return;

                    }


                    room.selectedRoles =
                        selectedRoles;


                    room.lastActivity =
                        Date.now();

                }
            );


            // =================================================
            // DEAL CARDS
            // =================================================

            socket.on(
                "deal_cards",
                ({
                    roomCode,
                    hostToken
                }) => {

                    const room =
                        getRoom(roomCode);


                    if (!room) {

                        socket.emit(
                            "deal_error",
                            {
                                message:
                                    "Phòng không tồn tại"
                            }
                        );

                        return;

                    }


                    // -----------------------------
                    // HOST CHECK
                    // -----------------------------

                    if (
                        room.hostToken !==
                        hostToken
                    ) {

                        socket.emit(
                            "deal_error",
                            {
                                message:
                                    "Không có quyền chia bài"
                            }
                        );

                        return;

                    }


                    // -----------------------------
                    // STATUS CHECK
                    // -----------------------------

                    if (
                        room.status !==
                        "SETUP"
                    ) {

                        socket.emit(
                            "deal_error",
                            {
                                message:
                                    "Phòng chưa ở trạng thái chọn bài"
                            }
                        );

                        return;

                    }


                    // =================================================
                    // CREATE DECK
                    // =================================================

                    let deck = [];


                    Object.entries(
                        room.selectedRoles
                    ).forEach(
                        ([role, quantity]) => {

                            const count =
                                Number(quantity) || 0;


                            for (
                                let i = 0;
                                i < count;
                                i++
                            ) {

                                deck.push(
                                    role
                                );

                            }

                        }
                    );


                    // =================================================
                    // CHECK NUMBER OF CARDS
                    // =================================================

                    if (
                        deck.length <
                        room.players.length
                    ) {

                        socket.emit(
                            "deal_error",
                            {
                                message:
                                    `Chưa đủ bài. Cần ${room.players.length} lá nhưng hiện chỉ có ${deck.length} lá.`
                            }
                        );

                        return;

                    }


                    // =================================================
                    // SHUFFLE
                    // =================================================

                    deck =
                        shuffle(deck);


                    // =================================================
                    // TAKE CARDS
                    // =================================================

                    const usedCards =
                        deck.slice(
                            0,
                            room.players.length
                        );


                    const remainingCards =
                        deck.slice(
                            room.players.length
                        );


                    // =================================================
                    // ASSIGN ROLE
                    // =================================================

                    room.players.forEach(
                        (player, index) => {

                            player.role =
                                usedCards[index];

                        }
                    );


                    // =================================================
                    // HISTORY
                    // =================================================

                    room.history =
                        room.players.map(
                            (player) => ({

                                playerId:
                                    player.id,

                                playerName:
                                    player.name,

                                role:
                                    player.role

                            })
                        );


                    room.assignments =
                        room.history;


                    // =================================================
                    // CHANGE STATUS
                    // =================================================

                    room.status =
                        "PLAYING";


                    room.lastActivity =
                        Date.now();


                    // =================================================
                    // SEND PRIVATE ROLE
                    // =================================================

                    room.players.forEach(
                        (player) => {

                            io.to(
                                player.id
                            ).emit(
                                "role_received",
                                {
                                    role:
                                        player.role
                                }
                            );

                        }
                    );


                    // =================================================
                    // REMAINING CARDS
                    // =================================================

                    const remainingCount = {};


                    remainingCards.forEach(
                        (role) => {

                            if (
                                !remainingCount[role]
                            ) {

                                remainingCount[role] =
                                    0;

                            }


                            remainingCount[role]++;

                        }
                    );


                    // =================================================
                    // HOST ONLY
                    // =================================================
                    //
                    // Gửi lịch sử cho Host.
                    //
                    // Player không nhận được danh sách
                    // role của người khác.
                    // =================================================

                    socket.emit(
                        "deal_completed",
                        {

                            history:
                                room.history,

                            remainingCards:
                                remainingCount

                        }
                    );


                    console.log(
                        `Cards dealt in room ${roomCode}`
                    );

                }
            );


            // =================================================
            // HISTORY
            // =================================================

            socket.on(
                "get_history",
                ({
                    roomCode,
                    hostToken
                }) => {

                    const room =
                        getRoom(roomCode);


                    if (!room) {

                        socket.emit(
                            "history_error",
                            {
                                message:
                                    "Phòng không tồn tại"
                            }
                        );

                        return;

                    }


                    if (
                        room.hostToken !==
                        hostToken
                    ) {

                        socket.emit(
                            "history_error",
                            {
                                message:
                                    "Bạn không có quyền xem lịch sử"
                            }
                        );

                        return;

                    }


                    socket.emit(
                        "history_data",
                        {
                            history:
                                room.history
                        }
                    );

                }
            );


            // =================================================
            // RESET ROOM
            // =================================================

            socket.on(
                "reset_room",
                ({
                    roomCode,
                    hostToken
                }) => {

                    const room =
                        getRoom(roomCode);


                    if (!room) {

                        socket.emit(
                            "reset_error",
                            {
                                message:
                                    "Phòng không tồn tại"
                            }
                        );

                        return;

                    }


                    if (
                        room.hostToken !==
                        hostToken
                    ) {

                        socket.emit(
                            "reset_error",
                            {
                                message:
                                    "Bạn không có quyền reset phòng"
                            }
                        );

                        return;

                    }


                    // -----------------------------
                    // NOTIFY CLIENTS
                    // -----------------------------

                    io.to(roomCode).emit(
                        "room_reset"
                    );


                    // -----------------------------
                    // DELETE ROOM
                    // -----------------------------

                    deleteRoom(
                        roomCode
                    );


                    console.log(
                        `Room ${roomCode} deleted`
                    );

                }
            );


            // =================================================
            // DISCONNECT
            // =================================================

            socket.on(
                "disconnect",
                () => {

                    console.log(
                        "Socket disconnected:",
                        socket.id
                    );

                }
            );

        }
    );

}

