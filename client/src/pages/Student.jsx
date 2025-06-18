import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ProgressBar, Button } from "react-bootstrap";
import tower from "../assets/tower-icon.png";
import IntervueLogo from "../Components/IntervueLogo";
import { getVariant } from "../utils/util";

const Student = ({ socket }) => {
  const [name, setName] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [connectedStudents, setConnectedStudents] = useState(null);
  const [votingValidation, setVotingValidation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);


  useEffect(() => {
    const name = sessionStorage.getItem("studentName");

    if (name) {
      setName(name);
      setShowQuestion(true);
      socket.emit("student-set-name", { name });
    }

    const handleNewQuestion = (question) => {
      setCurrentQuestion(question);
      setShowQuestion(true);
      setSelectedOption(null);
      setTimeLeft(question.timer); // initialize timer

      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);


      setTimeout(() => {
        setShowQuestion(false);
        clearInterval(interval); // stop the timer when time is up
      }, question.timer * 1000);
    };

    const handleStudentVoteValidation = (connectedStudents) => {
      setConnectedStudents(connectedStudents);
    };

    socket.on("new-question", handleNewQuestion);
    socket.on("student-vote-validation", handleStudentVoteValidation);

    return () => {
      socket.off("new-question", handleNewQuestion);
      socket.off("student-vote-validation", handleStudentVoteValidation);
    };
  }, [socket]);

  const handleSubmit = () => {
    sessionStorage.setItem("studentName", name);
    socket.emit("student-set-name", { name });
    setShowQuestion(true);
  };

  const handlePoling = () => {
    if (selectedOption) {
      console.log("Submitting option:", selectedOption);
      socket.emit("handle-polling", {
        option: selectedOption.text,
      });
    }
  };
  
  

  useEffect(() => {
    const found = connectedStudents
      ? connectedStudents?.find((data) => data.socketId === socket.id)
      : undefined;
    if (found) {
      setVotingValidation(found.voted);
    }
  }, [connectedStudents]);

  return (
    <div
     className="flex justify-center w-full h-[100] p-40"
    >
      {showQuestion && name ? (
        <div
          className="w-full"
        >
          {currentQuestion ? (
            currentQuestion.answered == false || votingValidation == false ? (
              <div
                className="gap-y-4 gap-x-4 ml-0 md:ml-4 p-12"
              >
                
                <div className="flex flex-col space-y-0 border border-[#AF8FF1] rounded-lg">
                <div className="bg-gradient-to-r from-[#343434] to-[#6E6E6E] rounded-t-lg text-white p-3">
                  <h2 className="text-xl font-bold">Question: {currentQuestion.question}</h2>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-300">
                      Time left: <span className="font-bold">{timeLeft}s</span>
                    </span>
                  </div>
                </div>

                  <div className=" rounded-lg p-10">
                    <div className="flex flex-col space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <div
                        key={index}
                        className={`
                          flex items-center space-x-3 p-4 rounded-md cursor-pointer
                          bg-[#F6F6F6] hover:bg-gray-200
                          ${selectedOption?.text === option.text ? 'border-2 border-[#8F64E1]' : 'border border-[#6edff6]'}
                        `}
                        onClick={() => setSelectedOption(option)}
                      >
                        {/* 1. Number badge */}
                        <span
                          className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 text-white font-semibold rounded-full border"
                          style={{
                            backgroundColor: selectedOption?.text === option.text ? '#8F64E1' : '#D3D3D3',
                            borderColor: selectedOption?.text === option.text ? '#8F64E1' : '#D3D3D3',
                          }}
                        >
                          {index + 1}
                        </span>

                        {/* 2. Option text */}
                        <span className="flex-1">
                          {option.text}
                        </span>
                      </div>
                    ))}

                    </div>
                  </div>
                </div>

                <div className="flex justify-end w-full mt-10">
                  <button
                    className="h-10 bg-[#8F64E1] w-1/5 rounded-lg font-semibold hover:scale-105 transform hover:scale-105 transition-transform "
                    variant="primary"
                    onClick={handlePoling}
                    disabled={!selectedOption}
                  >
                    Submit
                  </button>
                </div>

              </div>
            ) : (
              <div
                className="mt-12 mb-12 border border-[#6edff6] bg-[#134652]"
              >
                <h2
                  className="text-center items-center font-bold text-xl flex justify-center m-3"
                >
                  <img
                    src={tower}
                    alt=""
                    width="20px"
                    height="20px"
                    className="mr-5"
                  />
                  Live Results
                </h2>
                <ul
                  className="gap-y-4 gap-x-4 border-t border-[#6edff6] w-full"
                >
                  {currentQuestion &&
                    Object.entries(currentQuestion.optionsFrequency).map(
                      ([option]) => (
                        <div
                          className="m-4"
                        >
                          <ProgressBar
                            now={
                              parseInt(currentQuestion.results[option]) ?? "0"
                            }
                            label={<span className="text-xl text-black font-semibold">{option}              {parseInt(
                              currentQuestion.results[option]
                            )}%</span>}
                            variant={getVariant(
                              parseInt(currentQuestion.results[option])
                            )}
                            animated={
                              getVariant(
                                parseInt(currentQuestion.results[option])
                              ) != "success"
                            }
                          />
                        </div>
                      )
                    )}
                </ul>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4">
              <IntervueLogo />
              <h1 className="text-center text-lg">Welcome, {name}</h1>
              <h2 className="text-[33px]">
                Wait for the teacher to ask questions..
              </h2>
              <div className="mt-8">
                <svg className="w-12 h-12 animate-spin" viewBox="0 0 50 50">
                  <defs>
                    <linearGradient
                      id="spinner-gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#7565D9" />
                      <stop offset="100%" stopColor="#4D0ACD" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke="url(#spinner-gradient)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray="31.4 31.4"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      ) : (
        
      <div className="flex items-center justify-center flex-col space-y-5 p-10">
          <IntervueLogo />
          <h2 className="text-black font-sora text-[40px] font-light">
            Let’s <span className="font-normal">Get Started</span>
          </h2>
          <p className="text-center text-black">
            If you’re a student, you’ll submit answers, participate in live
            polls, and see how you compare.
          </p>
          <div className="w-full max-w-md">
            <label className="text-black">Enter your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-11 p-3 border rounded-md bg-[#F2F2F2] text-black outline-none"
            />
          </div>
          <Button
            className="bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-white p-[10px] rounded-[11px] w-[233px] transition transform hover:scale-105 mt-10"
            onClick={handleSubmit}
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};

export default Student;








