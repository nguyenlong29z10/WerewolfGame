import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import socket from "../services/socket";


export default function History() {

    const { roomCode } =
        useParams();

    const navigate =
        useNavigate();


    // =====================================================
    // HISTORY
    // =====================================================

    const [history, setHistory] =
        useState([]);


    // =====================================================
    // ERROR
    // =====================================================

    const [error, setError] =
        useState("");


    // =====================================================
    // RESET STATUS
    // =====================================================

    const [resetting, setResetting] =
        useState(false);


    // =====================================================
    // HOST TOKEN
    // =====================================================

    const hostToken =
        localStorage.getItem(
            "hostToken"
        );


    // =====================================================
    // LOAD HISTORY
    // =====================================================

    useEffect(() => {

        // =================================================
        // HISTORY DATA
        // =================================================

        const handleHistory =
            ({ history }) => {

                console.log(
                    "HISTORY DATA:",
                    history
                );


                setHistory(
                    Array.isArray(history)
                        ? history
                        : []
                );

            };


        // =================================================
        // HISTORY ERROR
        // =================================================

        const handleHistoryError =
            ({ message }) => {

                setError(
                    message ||
                    "Không thể lấy lịch sử ván chơi"
                );

            };


        // =================================================
        // ROOM RESET
        // =================================================

        const handleRoomReset =
            () => {

                console.log(
                    "ROOM RESET"
                );


                // -----------------------------
                // XÓA HOST TOKEN
                // -----------------------------

                localStorage.removeItem(
                    "hostToken"
                );


                // -----------------------------
                // QUAY VỀ TRANG CHỦ
                // -----------------------------

                navigate(
                    "/"
                );

            };


        // =================================================
        // RESET ERROR
        // =================================================

        const handleResetError =
            ({ message }) => {

                setResetting(
                    false
                );


                setError(
                    message ||
                    "Không thể reset phòng"
                );

            };


        // =================================================
        // REGISTER SOCKET EVENTS
        // =================================================

        socket.on(
            "history_data",
            handleHistory
        );


        socket.on(
            "history_error",
            handleHistoryError
        );


        socket.on(
            "room_reset",
            handleRoomReset
        );


        socket.on(
            "reset_error",
            handleResetError
        );


        // =================================================
        // REQUEST HISTORY
        // =================================================

        socket.emit(
            "get_history",
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
                "history_data",
                handleHistory
            );


            socket.off(
                "history_error",
                handleHistoryError
            );


            socket.off(
                "room_reset",
                handleRoomReset
            );


            socket.off(
                "reset_error",
                handleResetError
            );

        };

    }, [
        roomCode,
        hostToken,
        navigate
    ]);


    // =====================================================
    // RESET GAME
    // =====================================================

    const handleReset =
        () => {

            if (resetting) {
                return;
            }


            const confirmed =
                window.confirm(
                    "Bạn có chắc muốn reset ván chơi?\n\nLịch sử và phòng hiện tại sẽ bị xóa."
                );


            if (!confirmed) {
                return;
            }


            setError("");


            setResetting(
                true
            );


            // =================================================
            // SEND RESET REQUEST
            // =================================================

            socket.emit(
                "reset_room",
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

            <div className="history-container">


                {/* ===================================== */}
                {/* TITLE */}
                {/* ===================================== */}

                <h1>
                    LỊCH SỬ VÁN CHƠI
                </h1>


                {/* ===================================== */}
                {/* ROOM CODE */}
                {/* ===================================== */}

                <div className="history-room">

                    Phòng:

                    <strong>
                        {roomCode}
                    </strong>

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
                {/* HISTORY */}
                {/* ===================================== */}

                {history.length === 0 ? (

                    <div className="history-empty">

                        Chưa có dữ liệu lịch sử.

                    </div>

                ) : (

                    <div className="history-list">

                        {history.map(
                            (
                                item,
                                index
                            ) => (

                                <div
                                    className="history-item"
                                    key={
                                        item.playerId ||
                                        index
                                    }
                                >

                                    <span>
                                        {index + 1}
                                    </span>


                                    <strong>
                                        {item.playerName}
                                    </strong>


                                    <span>
                                        →
                                    </span>


                                    <strong>
                                        {item.role}
                                    </strong>

                                </div>

                            )
                        )}

                    </div>

                )}


                {/* ===================================== */}
                {/* RESET GAME */}
                {/* ===================================== */}

                <button
                    type="button"
                    className="primary-btn"
                    onClick={handleReset}
                    disabled={resetting}
                >

                    {resetting
                        ? "ĐANG RESET..."
                        : "🔄 RESET GAME"
                    }

                </button>


            </div>

        </div>

    );

}

