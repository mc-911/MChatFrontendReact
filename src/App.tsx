import "./Components/css/style.css";
import { Routes, Route } from "react-router-dom";
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
      <Route path="/registration" element={<Registration />} />
      <Route element={<PrivateRoutes />}>
        <Route path="/home" element={<Home />} >
          <Route path="/home/friends" element={<FriendsPage />} >
            <Route path="/home/friends/all" element={<AllFriends />} />
            <Route path="/home/friends/pending" element={<PendingRequests />} />
          </ Route>
          <Route path="/home/chat/:id" element={<Chat />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
