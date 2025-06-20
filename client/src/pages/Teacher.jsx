import React, { useState, useEffect } from "react";
import PollingResult from "./PollingResult";
import { Button } from "react-bootstrap";
import IntervueLogo from "../Components/IntervueLogo";
import ChatBox from "../Components/Chatbox";
import { useNavigate } from "react-router-dom";

const Teacher = ({ socket }) => {
  const navigate = useNavigate();

  const [questionRaw, setQuestionRaw] = useState("");
  const [options, setOptions] = useState([{ text: "", isyes: null }]);
  const [questionPublished, setQuestionPublished] = useState(false);
  const [timer, setTimer] = useState(60);
  const [showPeoplePanel, setShowPeoplePanel] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    socket.on("student-connected", (studentList) => {
      setStudents(studentList);
    });
  
    return () => {
      socket.off("student-connected");
    };
  }, [socket]);

  const maxWords = 100;

  const handleChange = (e) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/).filter(Boolean);
    const truncatedWords = words.slice(0, maxWords);
    const cutoffIndex = text
      .split(/\s+/)
      .slice(0, maxWords)
      .join(" ").length;
    const hasSpace = text[cutoffIndex] === " ";
    setQuestionRaw(text.slice(0, cutoffIndex + (hasSpace ? 1 : 0)));
  };

  const currentWords = questionRaw.trim().split(/\s+/).filter(Boolean).length;

  const askQuestion = () => {
    const questionData = {
      question: questionRaw.trim(),
      options: options.map((o) => ({ text: o.text, isyes: o.isyes })),
      timer: Number(timer),
    };
    if (socket && questionData.question && questionData.options.length) {
      socket.emit("teacher-ask-question", questionData);
      setQuestionPublished(true);
    }
  };

  const showResponse = () => {
    navigate("/responses");
  };
  
  const addOption = () =>
    setOptions((prev) => [...prev, { text: "", isyes: null }]);

  const updateOption = (i, field, value) => {
    setOptions((prev) =>
      prev.map((opt, idx) =>
        idx === i ? { ...opt, [field]: value } : opt
      )
    );
  };

  const askAnotherQuestion = () => {
    setQuestionRaw("");
    setOptions([{ text: "", isyes: null }]);
    setTimer(60);
    setQuestionPublished(false);
  };

  return (
    <div className="">
      {questionPublished ? (
        <div>
          <PollingResult socket={socket} />
          <div className="flex items-center justify-center">
            <button
              variant="primary"
              className="bg-[#7451B6] text-[#7451B6] p-[10px] rounded-[11px] border
              border-[#7451B6] opacity-90 
              text-white
              hover:scale-105
              transform hover:scale-105 transition-transform"
              onClick={askAnotherQuestion}
            >
              Ask Another Question?
            </button>
          </div>
          
        </div>
      ) : (
      <div className="flex flex-col gap-y-5 text-white pl-5 md:pl-10 lg:pl-20 pt-5 md:pt-10 lg:pt-20 overflow-y-scroll">
          <IntervueLogo></IntervueLogo>
          <h1 className="text-black font-sora text-[40px] font-light">
            Let’s <span className="font-normal">Get Started</span>
          </h1>
          <p className="text-[#454545] text-[16px] max-w-[728px]">
          you’ll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
          </p>

          {/* Question, timer, word counter... */}
          <div className="relative w-full max-w-[350px] md:max-w-[865px] flex flex-col space-y-2">
            <div className="flex justify-between items-center md:flex-row flex-col">
              <p className="text-black text-[20px]">Timer (seconds)</p>
              <div className="inline-flex items-center bg-[#F1F1F1] rounded-lg">
                <input
                  type="number"
                  value={timer}
                  onChange={(e) => setTimer(e.target.value)}
                  className="text-black bg-transparent outline-none px-3 py-2 rounded-l-lg"
                />
                <span className="px-3 py-2 text-gray-600 bg-gray-200 rounded-r-lg">
                  seconds
                </span>
              </div>
            </div>
            <textarea
              value={questionRaw}
              onChange={handleChange}
              placeholder="Enter question..."
              className="w-full h-24 border border-[#0dcaf0] bg-[#F2F2F2] text-black rounded-md p-2 resize-none"
            />
            <div className="absolute bottom-2 right-3 text-sm text-gray-600">
              {currentWords} / {maxWords} words
            </div>
          </div>

          <div className="max-w-[350px] md:max-w-[700px] flex flex-col space-y-2">
            <div className="text-black flex justify-between">
              <p>
                Edit Options
              </p>
              <p>Is it Correct?</p>
            </div>
            <div>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center space-x-3 mb-3 ">
                  {/* Option number badge */}
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 text-white rounded-full flex-shrink-0"
                    style={{ backgroundColor: "#4E377B" }}
                  >
                    {i + 1}
                  </span>

                  {/* Text input */}
                  <input
                    type="text"
                    value={opt.text}
                    placeholder={`Option ${i + 1}`}
                    onChange={(e) => updateOption(i, "text", e.target.value)}
                    className="flex-1 h-11 p-3 border rounded-md bg-[#F2F2F2] text-black outline-none"
                  />

                  {/* yes / no radios */}
                  <div className="flex items-center space-x-4">
                    {["yes", "no"].map((val) => (
                      <label
                        key={val}
                        className="inline-flex items-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`yes-${i}`}
                          value={val}
                          checked={
                            (val === "yes" && opt.isyes === true) ||
                            (val === "no" && opt.isyes === false)
                          }
                          onChange={() =>
                            updateOption(i, "isyes", val === "yes")
                          }
                          className="sr-only peer"
                        />
                        <span className="h-4 w-4 rounded-full border-2 border-gray-300 peer-checked:border-transparent peer-checked:bg-[#4E377B] transition-colors"></span>
                        <span className="ml-1 text-sm text-black">
                          {val.charAt(0).toUpperCase() + val.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between md:mr-20 mr-5">
            <button
              variant="outline-info"
              className="
              bg-white text-[#7451B6]
              p-[10px] rounded-[11px] w-[169px] border border-[#7451B6]
              hover:!bg-[#7451B6] hover:!text-white 
              transition md:ml-12"              
              onClick={addOption}
            >
              Add More option
            </button>

            <div className="flex space-x-2 flex-col md:flex-row">

            <button
                className="bg-[#7451B6] text-[#7451B6] p-[10px] rounded-[11px] border
                          border-[#7451B6] opacity-90 
                          text-white
                          hover:scale-105
                          transform hover:scale-105 transition-transform ml-40"
                onClick={askQuestion}
              >
                Ask Question
              </button>


              <button
                className="bg-[#7451B6] text-white p-[10px] rounded-[11px] border border-[#7451B6] opacity-90 hover:scale-105 transition-transform ml-40"
                onClick={showResponse}
              >
                Show Previous Responses
              </button>



            </div>

          </div>

          <button
            onClick={() => {
              setShowPeoplePanel((prev) => {
                if (!prev) setShowChatPanel(false);
                return !prev;
              });
            }}
            className="fixed bottom-6 right-6 bg-[#4E377B] text-white p-3 rounded-full shadow-lg hover:bg-[#36285a] transition z-50"
            aria-label="Show People"
          >
            👥
          </button>

          {/* Chat button */}
          <button
            onClick={() => {
              setShowChatPanel((prev) => {
                if (!prev) setShowPeoplePanel(false);
                return !prev;
              });
            }}
            className="fixed bottom-6 right-20 bg-[#4E377B] text-white p-3 rounded-full shadow-lg hover:bg-[#36285a] transition z-50"
            aria-label="Show Chat"
          >
            💬
          </button>

            {/* People Panel */}
            {showPeoplePanel && (
              <div className="fixed bottom-20 right-6 w-72 bg-white border border-gray-300 rounded-xl shadow-xl p-4 z-50">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-black">Participants</h3>
                  <button
                    onClick={() => setShowPeoplePanel(false)}
                    className="text-gray-500 hover:text-black text-2xl font-semibold"
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>
                <ul className="space-y-2 text-black text-sm max-h-48 overflow-auto">
                {students.map((student) => (
                  <li key={student.socketId} className="flex justify-between items-center">
                    <span>{student.name}</span>
                    <button
                      onClick={() => socket.emit("kick-student", student.socketId)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>

              </div>
            )}

              {showChatPanel && (
                  <ChatBox socket={socket} username="Teacher" role="Teacher" />
              )}
        </div>
      
      )}

        {!questionPublished && <div className="pb-4 pt-14">
            <hr className="border-t border-gray-800 mb-0" />

            {/* Right-aligned button */}
            <div className="">
              
            </div>
          </div>
      }
    </div>
  );
};

export default Teacher;
