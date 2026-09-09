import {
    useEffect
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import socket from "../services/socket";

export default function PlayerWaiting() {

    const { roomCode } = useParams();

    const navigate = useNavigate();


    useEffect(() => {

        const handleStarted = () => {

            navigate(
                `/player/role/${roomCode}`
            );

        };


        socket.on(
            "game_started",
            handleStarted
        );


        return () => {

            socket.off(
                "game_started",
                handleStarted
            );

        };

    }, [roomCode]);


    return (
        <div className="page waiting-page">

            <div className="waiting-card">

                <div className="wolf-animation">
                    🐺
                </div>

                <h1>ĐÃ THAM GIA</h1>

                <p>
                    Bạn đã vào phòng
                </p>

                <p>
                    Quản trò đang chuẩn bị
                    các lá bài...
                </p>

                <div className="loading">
                    ● ● ●
                </div>

            </div>

        </div>
    );
}