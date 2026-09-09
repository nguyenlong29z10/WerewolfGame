import {
    useState,
    useEffect
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import socket from "../services/socket";

export default function PlayerJoin() {

    const { roomCode } = useParams();

    const navigate = useNavigate();

    const [name, setName] =
        useState("");

    const [error, setError] =
        useState("");


    useEffect(() => {

        const handleJoined =
            ({ playerToken }) => {

                localStorage.setItem(
                    `playerToken_${roomCode}`,
                    playerToken
                );

                navigate(
                    `/player/waiting/${roomCode}`
                );

            };


        const handleError =
            ({ message }) => {

                setError(message);

            };


        socket.on(
            "player_joined",
            handleJoined
        );

        socket.on(
            "join_error",
            handleError
        );


        return () => {

            socket.off(
                "player_joined",
                handleJoined
            );

            socket.off(
                "join_error",
                handleError
            );

        };

    }, [roomCode]);


    const joinGame = () => {

        setError("");

        socket.emit(
            "join_player",
            {
                roomCode,
                name
            }
        );

    };


    return (
        <div className="page">

            <div className="join-card">

                <div className="wolf-icon">
                    🐺
                </div>

                <h1>THAM GIA</h1>

                <p>
                    Phòng {roomCode}
                </p>


                <input
                    type="text"
                    placeholder="Nhập tên của bạn"
                    value={name}
                    maxLength={20}
                    onChange={
                        e =>
                            setName(
                                e.target.value
                            )
                    }
                />


                {error && (
                    <div className="error">
                        {error}
                    </div>
                )}


                <button
                    className="primary-btn"
                    onClick={joinGame}
                >
                    THAM GIA
                </button>

            </div>

        </div>
    );
}