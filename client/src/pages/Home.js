import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import IntervueLogo from "../Components/IntervueLogo";

const socket = io.connect("http://localhost:3001");

const Home = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
  };

  const handleSubmit = () => {
    if (role === "teacher") {
      navigate("/teacher");
    } else if (role === "student") {
      navigate("/student");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen space-y-5">
      <IntervueLogo></IntervueLogo>
      <div className="flex flex-col items-center justify-center space-y-1">
        <p className="text-[#000000] font-sora text-[40px] font-light">
          Welcome to the <span className="bold-text">Live Polling System</span>
        </p>
        <p className="text-[#000000] font-sora text-[19px]">
          Please select the role that best describes you to begin using the live polling system
        </p>
      </div>

      <div className="flex space-x-10">
        {/* Student */}
        <div
          onClick={() => handleRoleSelection("student")}
          className={`w-[387px] rounded-xl p-[3px] transition-colors duration-200 cursor-pointer ${
            role === "student"
              ? "bg-gradient-to-r from-[#7765DA] to-[#1D68BD]"
              : "bg-[#D9D9D9] hover:bg-gradient-to-r hover:from-[#7765DA] hover:to-[#1D68BD]"
          }`}
        >
          <div className="bg-white rounded-lg p-4">
            <h3 className="text-[23px] text-black font-sora font-semibold">I’m a Student</h3>
            <p className="text-[#454545] text-[16px]">
              Participate in polls and answer the questions asked by teacher
            </p>
          </div>
        </div>

        {/* Teacher */}
        <div
          onClick={() => handleRoleSelection("teacher")}
          className={`w-[387px] rounded-xl p-[3px] transition-colors duration-200 cursor-pointer ${
            role === "teacher"
              ? "bg-gradient-to-r from-[#7765DA] to-[#1D68BD]"
              : "bg-[#D9D9D9] hover:bg-gradient-to-r hover:from-[#7765DA] hover:to-[#1D68BD]"
          }`}
        >
          <div className="bg-white rounded-lg p-4">
            <h3 className="text-[23px] text-black font-sora font-semibold">I’m a Teacher</h3>
            <p className="text-[#454545] text-[16px]">
              Create polls and view live poll results in real-time.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!role}
        className="pt-[17px] pb-[17px] pl-[70px] pr-[70px] bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] rounded-[34px]
                   transition-opacity duration-150 ease-in-out hover:opacity-90 disabled:opacity-90 text-white"
      >
        Continue
      </button>
    </div>
  );
};

export default Home;
