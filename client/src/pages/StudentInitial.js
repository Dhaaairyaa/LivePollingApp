import React, { useEffect, useState } from "react";
import IntervueLogo from "../Components/IntervueLogo";
import Student from "./Student"; // Assuming Student is in the same directory
import socket from "../socket"; // Assuming you export socket from a shared file

const StudentInitial = () => {
  const [name, setName] = useState("");
  const [showStudent, setShowStudent] = useState(false);

  // Check sessionStorage on load
  useEffect(() => {
    const storedName = sessionStorage.getItem("studentName");
    if (storedName) {
      setName(storedName);
      setShowStudent(true);
      socket.emit("student-set-name", { name: storedName });
    }
  }, []);

  const handleSubmit = () => {
    if (name.trim()) {
      sessionStorage.setItem("studentName", name);
      setShowStudent(true);
      socket.emit("student-set-name", { name });
    }
  };

  if (showStudent) {
    return <Student socket={socket} />;
  }

  return (
    <div className="p-8">
      <IntervueLogo />
      <h2 className="text-black font-sora text-[40px] font-light">
        Let’s <span className="font-normal">Get Started</span>
      </h2>
      <p className="font-sora mb-6">
        If you’re a student, you’ll be able to <span className="font-bold">submit your answers,</span> participate in live polls, and see how your responses compare with your classmates.
      </p>

      <div className="mt-6">
        <p className="mb-2">Enter your Name</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
          className="w-[45%] h-10 p-2.5 border border-[#0dcaf0] rounded-md bg-[#2a444a] outline-none text-white"
        />
        <button
          onClick={handleSubmit}
          className="ml-4 px-5 py-2 bg-[#0dcaf0] text-white rounded-md hover:opacity-90 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default StudentInitial;
