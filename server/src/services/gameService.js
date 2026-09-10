
const rooms = new Map();


// =====================================================
// ROLE LIST
// =====================================================

const ROLE_LIST = [
    "Dân làng",
    "Tiên tri",
    "Phù thủy",
    "Bảo vệ",
    "Thợ săn",
    "Già làng",
    "Liễu",
    "Nhân bản",
    "Hoàng tử",
    "Gấu",
    "Chị em",
    "Cupid",
    "Thằng ngốc",
    "Tu sĩ",
    "Cáo",
    "Sói nguyền",
    "Sói",
    "Sói tiên tri",
    "Sói ngu",
    "Sói con",
    "Bán sói"
];


// =====================================================
// ROOMS
// =====================================================

export const getRooms = () => rooms;


// =====================================================
// CREATE ROOM
// =====================================================

export const createRoom = (roomCode, hostToken) => {

    const selectedRoles = {};

    ROLE_LIST.forEach((role) => {

        selectedRoles[role] = 0;

    });


    const room = {

        roomCode,

        hostToken,

        status: "WAITING",

        players: [],

        selectedRoles,

        assignments: [],

        history: [],

        createdAt: Date.now(),

        lastActivity: Date.now()

    };


    rooms.set(
        roomCode,
        room
    );


    return room;
};


// =====================================================
// GET ROOM
// =====================================================

export const getRoom = (roomCode) => {

    return rooms.get(roomCode);

};


// =====================================================
// DELETE ROOM
// =====================================================

export const deleteRoom = (roomCode) => {

    rooms.delete(roomCode);

};


// =====================================================
// GET ROLE LIST
// =====================================================

export const getRoleList = () => {

    return ROLE_LIST;

};


// =====================================================
// GET HOST ROOM STATE
// =====================================================
//
// Không gửi hostToken / playerToken
// xuống frontend.
//
// Host chỉ nhận dữ liệu cần thiết.
// =====================================================

export const getHostRoomState = (room) => {

    return {

        roomCode:
            room.roomCode,

        status:
            room.status,

        playerCount:
            room.players.length,

        players:
            room.players.map(
                (player) => ({

                    id:
                        player.id,

                    name:
                        player.name

                })
            ),

        selectedRoles:
            room.selectedRoles,

        history:
            room.history

    };

};

