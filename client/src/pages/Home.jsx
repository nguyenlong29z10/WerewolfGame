import { useNavigate } from "react-router-dom";
import socket from "../services/socket";

export default function Home() {

    const navigate = useNavigate();

    const createRoom = () => {

        socket.emit("create_room");

        socket.once(
            "room_created",
            ({ roomCode, hostToken }) => {

                localStorage.setItem(
                    "hostToken",
                    hostToken
                );

                navigate(
                    `/host/${roomCode}`
                );

            }
        );

    };

    return (
        <div className="page home-page">

            <div className="home-card">

                <div className="wolf-icon">
                    🐺
                </div>

                <h1>MA SÓI</h1>

                <p>
                    Tạo phòng và chia bài
                    cho trò chơi Ma Sói
                </p>

                <button
                    onClick={createRoom}
                    className="primary-btn"
                >
                    BẮT ĐẦU TRÒ CHƠI
                </button>

            </div>

        </div>
    );
}