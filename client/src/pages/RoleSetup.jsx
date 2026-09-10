
import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import socket from "../services/socket";


// =====================================================
// ROLE LIST
// =====================================================

const ROLES = [
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


export default function RoleSetup() {

    const {
        roomCode
    } = useParams();


    const navigate =
        useNavigate();


    // =====================================================
    // HOST TOKEN
    // =====================================================

    const hostToken =
        localStorage.getItem(
            "hostToken"
        );


    // =====================================================
    // PLAYER COUNT
    // =====================================================

    const [
        players,
        setPlayers
    ] = useState(0);


    // =====================================================
    // PLAYER LIST
    // =====================================================

    const [
        playerList,
        setPlayerList
    ] = useState([]);


    // =====================================================
    // ROLE QUANTITY
    // =====================================================

    const [
        roles,
        setRoles
    ] = useState(() => {

        const data = {};


        ROLES.forEach(
            (role) => {

                data[role] = 0;

            }
        );


        return data;

    });


    // =====================================================
    // ERROR
    // =====================================================

    const [
        error,
        setError
    ] = useState("");


    // =====================================================
    // SOCKET
    // =====================================================

    useEffect(() => {


        // =================================================
        // ROOM STATE
        // =================================================

        const handleRoomState =
            (roomState) => {

                console.log(
                    "ROOM STATE:",
                    roomState
                );


                // -----------------------------
                // PLAYER COUNT
                // -----------------------------

                if (
                    roomState &&
                    typeof roomState.playerCount ===
                    "number"
                ) {

                    setPlayers(
                        roomState.playerCount
                    );

                }


                // -----------------------------
                // PLAYER LIST
                // -----------------------------

                if (
                    roomState &&
                    Array.isArray(
                        roomState.players
                    )
                ) {

                    setPlayerList(
                        roomState.players
                    );

                }


                // -----------------------------
                // SELECTED ROLES
                // -----------------------------

                if (
                    roomState &&
                    roomState.selectedRoles
                ) {

                    setRoles(
                        (prev) => ({

                            ...prev,

                            ...roomState.selectedRoles

                        })
                    );

                }

            };


        // =================================================
        // PLAYERS UPDATED
        // =================================================

        const handlePlayersUpdated =
            ({ players }) => {

                console.log(
                    "PLAYERS UPDATED:",
                    players
                );


                if (
                    Array.isArray(
                        players
                    )
                ) {

                    setPlayerList(
                        players
                    );


                    setPlayers(
                        players.length
                    );

                }

            };


        // =================================================
        // DEAL COMPLETED
        // =================================================

        const handleDealCompleted =
            ({
                history,
                remainingCards
            }) => {

                console.log(
                    "DEAL COMPLETED:",
                    {
                        history,
                        remainingCards
                    }
                );


                // -----------------------------------------
                // SAU KHI CHIA XONG
                // CHUYỂN SANG HISTORY
                // -----------------------------------------

                navigate(
                    `/host/history/${roomCode}`
                );

            };


        // =================================================
        // DEAL ERROR
        // =================================================

        const handleDealError =
            ({ message }) => {

                setError(
                    message ||
                    "Không thể chia bài"
                );

            };


        // =================================================
        // ROOM NOT FOUND
        // =================================================

        const handleRoomNotFound =
            () => {

                setError(
                    "Phòng không tồn tại hoặc đã bị xóa"
                );

            };


        // =================================================
        // HOST UNAUTHORIZED
        // =================================================

        const handleHostUnauthorized =
            () => {

                setError(
                    "Bạn không có quyền quản trò phòng này"
                );

            };


        // =================================================
        // REGISTER SOCKET EVENTS
        // =================================================

        socket.on(
            "room_state",
            handleRoomState
        );


        socket.on(
            "players_updated",
            handlePlayersUpdated
        );


        socket.on(
            "deal_completed",
            handleDealCompleted
        );


        socket.on(
            "deal_error",
            handleDealError
        );


        socket.on(
            "room_not_found",
            handleRoomNotFound
        );


        socket.on(
            "host_unauthorized",
            handleHostUnauthorized
        );


        // =================================================
        // REQUEST CURRENT ROOM STATE
        // =================================================

        socket.emit(
            "host_reconnect",
            {
                roomCode,
                hostToken
            }
        );


        // =================================================
        // CLEANUP
        // =================================================

        return () => {

            socket.off(
                "room_state",
                handleRoomState
            );


            socket.off(
                "players_updated",
                handlePlayersUpdated
            );


            socket.off(
                "deal_completed",
                handleDealCompleted
            );


            socket.off(
                "deal_error",
                handleDealError
            );


            socket.off(
                "room_not_found",
                handleRoomNotFound
            );


            socket.off(
                "host_unauthorized",
                handleHostUnauthorized
            );

        };

    }, [
        roomCode,
        hostToken,
        navigate
    ]);


    // =====================================================
    // TOTAL CARDS
    // =====================================================

    const totalCards =
        Object.values(
            roles
        ).reduce(
            (
                sum,
                value
            ) => {

                return (
                    sum +
                    Number(value || 0)
                );

            },
            0
        );


    // =====================================================
    // CHANGE ROLE QUANTITY
    // =====================================================

    const changeRole =
        (
            role,
            amount
        ) => {

            setRoles(
                (prev) => {

                    const next = {
                        ...prev
                    };


                    next[role] =
                        Math.max(
                            0,
                            Number(
                                next[role] || 0
                            ) +
                            amount
                        );


                    // -----------------------------
                    // SAVE TO SERVER
                    // -----------------------------

                    socket.emit(
                        "update_roles",
                        {

                            roomCode,

                            hostToken,

                            selectedRoles:
                                next

                        }
                    );


                    return next;

                }
            );

        };


    // =====================================================
    // DEAL CARDS
    // =====================================================

    const dealCards =
        () => {

            setError("");


            // -----------------------------
            // CHECK PLAYER
            // -----------------------------

            if (
                players === 0
            ) {

                setError(
                    "Chưa có người chơi"
                );

                return;

            }


            // -----------------------------
            // CHECK CARDS
            // -----------------------------

            if (
                totalCards <
                players
            ) {

                setError(
                    `Cần ít nhất ${players} lá bài`
                );

                return;

            }


            // -----------------------------
            // SEND REQUEST
            // -----------------------------

            socket.emit(
                "deal_cards",
                {
                    roomCode,
                    hostToken
                }
            );

        };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="page">

            <div className="setup-container">


                {/* ===================================== */}
                {/* TITLE */}
                {/* ===================================== */}

                <h1>
                    CHỌN LÁ BÀI
                </h1>


                {/* ===================================== */}
                {/* SUMMARY */}
                {/* ===================================== */}

                <div className="setup-summary">

                    <div>

                        👥{" "}

                        <strong>
                            {players}
                        </strong>{" "}

                        người

                    </div>


                    <div>

                        🃏{" "}

                        <strong>
                            {totalCards}
                        </strong>{" "}

                        lá

                    </div>

                </div>


                {/* ===================================== */}
                {/* PLAYER LIST */}
                {/* ===================================== */}

                <div className="player-list">

                    <h3>
                        👥 NGƯỜI CHƠI
                    </h3>


                    {playerList.length === 0 ? (

                        <p>
                            Chưa có người chơi
                        </p>

                    ) : (

                        playerList.map(
                            (
                                player,
                                index
                            ) => (

                                <div
                                    className="player-item"
                                    key={
                                        player.id ||
                                        index
                                    }
                                >

                                    <span>
                                        {index + 1}.
                                    </span>

                                    <strong>
                                        {player.name}
                                    </strong>

                                </div>

                            )
                        )

                    )}

                </div>


                {/* ===================================== */}
                {/* WARNING */}
                {/* ===================================== */}

                {totalCards < players && (

                    <div className="warning">

                        ⚠️ Còn thiếu{" "}

                        {players - totalCards}

                        {" "}lá

                    </div>

                )}


                {/* ===================================== */}
                {/* SUCCESS */}
                {/* ===================================== */}

                {totalCards >= players &&
                    players > 0 && (

                        <div className="success">

                            ✓ Đủ bài để chia

                        </div>

                    )}


                {/* ===================================== */}
                {/* ROLE LIST */}
                {/* ===================================== */}

                <div className="role-list">

                    {ROLES.map(
                        (role) => (

                            <div
                                className="role-card"
                                key={role}
                            >

                                <div>

                                    <strong>
                                        {role}
                                    </strong>

                                    <small>
                                        Số lượng
                                    </small>

                                </div>


                                {/* ================================= */}
                                {/* COUNTER */}
                                {/* ================================= */}

                                <div className="counter">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeRole(
                                                role,
                                                -1
                                            )
                                        }
                                    >
                                        −
                                    </button>


                                    <span>
                                        {
                                            roles[role] ??
                                            0
                                        }
                                    </span>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeRole(
                                                role,
                                                1
                                            )
                                        }
                                    >
                                        +
                                    </button>

                                </div>

                            </div>

                        )
                    )}

                </div>


                {/* ===================================== */}
                {/* ERROR */}
                {/* ===================================== */}

                {error && (

                    <div className="error">

                        {error}

                    </div>

                )}


                {/* ===================================== */}
                {/* DEAL BUTTON */}
                {/* ===================================== */}

                <button
                    type="button"
                    className="primary-btn deal-btn"
                    onClick={dealCards}
                    disabled={
                        players === 0 ||
                        totalCards < players
                    }
                >
                    🃏 CHIA BÀI
                </button>


            </div>

        </div>

    );

}

