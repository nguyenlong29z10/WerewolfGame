import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Home from "../pages/Home";
import HostRoom from "../pages/HostRoom";
import PlayerJoin from "../pages/PlayerJoin";
import PlayerWaiting from "../pages/PlayerWaiting";
import RoleSetup from "../pages/RoleSetup";
import PlayerRole from "../pages/PlayerRole";
import History from "../pages/History";

export default function AppRoutes() {

    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/host/:roomCode"
                    element={<HostRoom />}
                />

                <Route
                    path="/join/:roomCode"
                    element={<PlayerJoin />}
                />

                <Route
                    path="/player/waiting/:roomCode"
                    element={<PlayerWaiting />}
                />

                <Route
                    path="/host/setup/:roomCode"
                    element={<RoleSetup />}
                />

                <Route
                    path="/player/role/:roomCode"
                    element={<PlayerRole />}
                />

                <Route
                    path="/host/history/:roomCode"
                    element={<History />}
                />

            </Routes>

        </BrowserRouter>
    );
}