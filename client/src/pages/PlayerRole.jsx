import {
    useEffect,
    useState
} from "react";

import {
    useParams
} from "react-router-dom";

import socket from "../services/socket";


export default function PlayerRole() {

    const { roomCode } = useParams();

    const [role, setRole] =
        useState(null);

    const [revealed, setRevealed] =
        useState(false);


    useEffect(() => {

        const handleRole =
            ({ role }) => {

                setRole(role);

            };


        socket.on(
            "role_received",
            handleRole
        );


        return () => {

            socket.off(
                "role_received",
                handleRole
            );

        };

    }, []);


    if (!role) {

        return (
            <div className="page">

                <div className="waiting-card">

                    <div className="wolf-animation">
                        🐺
                    </div>

                    <h1>
                        ĐANG CHIA BÀI
                    </h1>

                    <p>
                        Vui lòng chờ...
                    </p>

                </div>

            </div>
        );

    }


    return (
        <div className="page role-page">

            <h1>BẠN NHẬN ĐƯỢC</h1>


            <div
                className={
                    `role-card-big ${
                        revealed
                            ? "revealed"
                            : ""
                    }`
                }
                onClick={() =>
                    setRevealed(true)
                }
            >

                {!revealed ? (

                    <>

                        <div className="card-back">
                            🐺
                        </div>

                        <p>
                            Nhấn để xem
                        </p>

                    </>

                ) : (

                    <>

                        <div className="role-icon">
                            🔮
                        </div>

                        <h2>
                            {role}
                        </h2>

                        <p>
                            Đây là vai trò
                            của bạn
                        </p>

                    </>

                )}

            </div>

        </div>
    );
}