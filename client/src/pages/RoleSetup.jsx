import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import socket from "../services/socket";


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
    "Sói con"
];


export default function RoleSetup() {

    const { roomCode } =
        useParams();

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
    // NUMBER OF PLAYERS
    // =====================================================

    const [players, setPlayers] =
        useState(0);


    // =====================================================
    // ROLE QUANTITY
    // =====================================================

    const [roles, setRoles] =
        useState(() => {

            const data = {};

            ROLES.forEach(
                (role) => {
                    data[role] = 0;
                }
            );

            return data;

        });


    // =====================================================
    // REMAINING CARDS
    // =====================================================

    const [remaining, setRemaining] =
        useState({});


    // =====================================================
    // ERROR
    // =====================================================

    const [error, setError] =
        useState("");


    // =====================================================
    // SOCKET
    // =====================================================

    useEffect(() => {

        // =================================================
        // ROOM STATE
        // =================================================
        //
        // Server gửi trạng thái phòng.
        //
        // Đây là nguồn chính để lấy số người chơi.
        //

        const handleRoomState =
            (roomState) => {

                console.log(
                    "ROOM STATE:",
                    roomState
                );


                if (
                    roomState &&
                    typeof roomState.playerCount ===
                    "number"
                ) {

                    setPlayers(
                        roomState.playerCount
                    );

                }


                // Nếu server có selectedRoles
                // thì đồng bộ luôn.

                if (
                    roomState &&
                    roomState.selectedRoles
                ) {

                    setRoles(
                        roomState.selectedRoles
                    );

                }

            };


        // =================================================
        // DEAL COMPLETED
        // =================================================

        const handleDealCompleted =
            ({ remainingCards }) => {

                setRemaining(
                    remainingCards
                );


                navigate(
                    `/host/${roomCode}`
                );

            };


        // =================================================
        // DEAL ERROR
        // =================================================

        const handleDealError =
            ({ message }) => {

                setError(message);

            };


        // =================================================
        // REGISTER LISTENERS
        // =================================================

        socket.on(
            "room_state",
            handleRoomState
        );


        socket.on(
            "deal_completed",
            handleDealCompleted
        );


        socket.on(
            "deal_error",
            handleDealError
        );


        // =================================================
        // REQUEST ROOM STATE
        // =================================================
        //
        // RoleSetup có thể được mở sau khi game_started
        // đã xảy ra.
        //
        // Vì vậy không phụ thuộc vào game_started.
        //
        // Khi RoleSetup mở, Host yêu cầu server gửi
        // trạng thái phòng hiện tại.
        //

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
                "deal_completed",
                handleDealCompleted
            );


            socket.off(
                "deal_error",
                handleDealError
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
        Object.values(roles).reduce(
            (sum, value) =>
                sum + value,
            0
        );


    // =====================================================
    // CHANGE ROLE QUANTITY
    // =====================================================

    const changeRole =
        (role, amount) => {

            setRoles(
                (prev) => {

                    const next = {
                        ...prev
                    };


                    next[role] =
                        Math.max(
                            0,
                            next[role] +
                            amount
                        );


                    // -------------------------------------
                    // SAVE TO SERVER
                    // -------------------------------------

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

    const dealCards = () => {

        setError("");


        // -------------------------------------
        // CHECK NUMBER OF CARDS
        // -------------------------------------

        if (
            totalCards <
            players
        ) {

            setError(
                `Cần ít nhất ${players} lá bài`
            );

            return;
        }


        // -------------------------------------
        // SEND TO SERVER
        // -------------------------------------

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

                        👥

                        <strong>
                            {players}
                        </strong>

                        người

                    </div>


                    <div>

                        🃏

                        <strong>
                            {totalCards}
                        </strong>

                        lá

                    </div>

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

                {totalCards >= players && (

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
                                        {roles[role]}
                                    </span>


                                    <button
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
                    className="primary-btn deal-btn"
                    onClick={dealCards}
                    disabled={
                        totalCards <
                        players
                    }
                >
                    🃏 CHIA BÀI
                </button>

            </div>

        </div>

    );

}