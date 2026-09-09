import {
    useEffect,
    useState
} from "react";

import {
    useParams
} from "react-router-dom";

import socket from "../services/socket";


export default function History() {

    const { roomCode } =
        useParams();

    const [history, setHistory] =
        useState([]);


    const hostToken =
        localStorage.getItem(
            "hostToken"
        );


    useEffect(() => {

        socket.emit(
            "get_history",
            {
                roomCode,
                hostToken
            }
        );


        const handleHistory =
            ({ history }) => {

                setHistory(history);

            };


        socket.on(
            "history_data",
            handleHistory
        );


        return () => {

            socket.off(
                "history_data",
                handleHistory
            );

        };

    }, [roomCode]);


    return (
        <div className="page">

            <div className="history-container">

                <h1>
                    LỊCH SỬ VÁN CHƠI
                </h1>


                {history.map(
                    (item, index) => (

                        <div
                            className="history-item"
                            key={item.playerId}
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

        </div>
    );
}