import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoleSelector from "./pages/Home";
import Student from "./pages/Student";
import Teacher from "./pages/Teacher";
import io from "socket.io-client";
import "../src/App.css";

const socket = io.connect("http://localhost:3001");

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelector />} />
        <Route path="/teacher" element={<Teacher socket={socket} />} />
        <Route path="/student" element={<Student socket={socket} />} />
      </Routes>
    </Router>
  );
};

export default App;
