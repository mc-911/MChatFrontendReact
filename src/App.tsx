import "./Components/css/style.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./Components/welcome";
import Registration from "./Components/registration";
import Home from "./Components/home";
import axios from "axios";
import PrivateRoutes from "./Components/protectedRoute";
import FriendsPage from "./Components/FriendsPage";
import { Chat } from "./Components/Chat";
import { AllFriends } from "./Components/AllFriends";
import { PendingRequests } from "./Components/PendingRequests";

axios.defaults.withCredentials = true;

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="registration" element={<Registration />} />
      <Route element={<PrivateRoutes />}>
        <Route path="home" element={<Home />} >
          <Route index element={<Navigate to={"friends"} />} />
          <Route path="friends" element={<FriendsPage />} >
            <Route index element={<Navigate to={"all"} />} />
            <Route path="all" element={<AllFriends />} />
            <Route path="pending" element={<PendingRequests />} />
          </ Route>
          <Route path="chat/:id" element={<Chat />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
