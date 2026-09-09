import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import { QRCodeSVG } from "qrcode.react";

import socket from "../services/socket";

export default function HostRoom() {

    const { roomCode } = useParams();

    const navigate = useNavigate();

    const [players, setPlayers] =
        useState([]);

    const [error, setError] =
        useState("");

    const hostToken =
        localStorage.getItem("hostToken");


    useEffect(() => {

        if (!hostToken) {
            navigate("/");
            return;
        }

        socket.emit(
            "host_reconnect",
            {
                roomCode,
                hostToken
            }
        );


        const handlePlayers =
            ({ players }) => {

                setPlayers(players);

            };


        const handleStarted =
            () => {

                navigate(
                    `/host/setup/${roomCode}`
                );

            };


        const handleError =
            ({ message }) => {

                setError(message);

            };


        socket.on(
            "players_updated",
            handlePlayers
        );

        socket.on(
            "game_started",
            handleStarted
        );

        socket.on(
            "action_error",
            handleError
        );


        return () => {

            socket.off(
                "players_updated",
                handlePlayers
            );

            socket.off(
                "game_started",
                handleStarted
            );

            socket.off(
                "action_error",
                handleError
            );

        };

    }, [roomCode]);


    const joinUrl =
        `${window.location.origin}/join/${roomCode}`;


    const startGame = () => {

        socket.emit(
            "start_setup",
            {
                roomCode,
                hostToken
            }
        );

    };


    return (
        <div className="page">

            <div className="host-container">

                <h1>PHÒNG MA SÓI</h1>

                <div className="room-code">
                    {roomCode}
                </div>

                <div className="qr-container">

                    <QRCodeSVG
                        value={joinUrl}
                        size={240}
                    />

                </div>

                <p>
                    Quét mã QR để tham gia
                </p>


                <div className="player-count">

                    👥 {players.length} người chơi

                </div>


                <div className="player-list">

                    {players.map(
                        (player, index) => (

                            <div
                                className="player-item"
                                key={player.id}
                            >

                                <span>
                                    {index + 1}
                                </span>

                                <strong>
                                    {player.name}
                                </strong>

                            </div>

                        )
                    )}

                </div>


                {error && (
                    <div className="error">
                        {error}
                    </div>
                )}


                <button
                    className="primary-btn"
                    disabled={
                        players.length === 0
                    }
                    onClick={startGame}
                >
                    BẮT ĐẦU
                </button>

            </div>

        </div>
    );
}