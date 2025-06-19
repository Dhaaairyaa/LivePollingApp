import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import io from "socket.io-client";
import "../src/App.css";
import RoleSelector from "./pages/Home";
import Student from "./pages/Student";
import Teacher from "./pages/Teacher";
import KickedOut from "./pages/KickedOut";
import ShowPrevResponse from "./pages/ShowPrevResponse"; // optional
import { SocketContext } from "./Context/SocketContext";

const socket = io.connect("http://localhost:3001");

const App = () => {
  return (
    <SocketContext.Provider value={socket}>
      <Router>
        <Routes>
          <Route path="/" element={<RoleSelector socket={socket} />} />
          <Route path="/teacher" element={<Teacher socket={socket} />} />
          <Route path="/student" element={<Student socket={socket} />} />
          <Route path="/removed" element={<KickedOut socket={socket} />} />
          <Route path="/responses" element={<ShowPrevResponse socket={socket} />} />
        </Routes>
      </Router>
    </SocketContext.Provider>
  );
};

export default App;
