import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Bar } from "react-chartjs-2";
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import tower from "../assets/tower-icon.png";
import IntervueLogo from "../Components/IntervueLogo";
import { getVariant } from "../utils/util";
import { toast } from "react-toastify";
import ChatBox from "../Components/Chatbox";

Chart.register(ChartDataLabels);

const Student = ({ socket }) => {
  const [name, setName] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [connectedStudents, setConnectedStudents] = useState(null);
  const [votingValidation, setVotingValidation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showChatPanel, setShowChatPanel] = useState(false);



  useEffect(() => {
    const handleDisconnect = () => {
      toast.error("You have been removed by the teacher.");
      sessionStorage.clear();
      
      setTimeout(() => {
        window.location.href = "/removed";
      }, 1000); // Wait for toast to be visible
    };
  
    socket.on("disconnect", handleDisconnect);
  
    return () => {
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  


  useEffect(() => {
    const storedName = sessionStorage.getItem("studentName");

    if (storedName) {
      setName(storedName);
      setShowQuestion(true);
      socket.emit("student-set-name", { name: storedName });
    }

    const handleNewQuestion = (question) => {
      console.log("New question received:", question.question);
      setCurrentQuestion(question);
      setShowQuestion(true);
      setSelectedOption(null);
      setTimeLeft(question.timer);
      setVotingValidation(false);

      let elapsed = 0;
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });

        elapsed += 1;
        if (elapsed >= question.timer) {
          clearInterval(interval);
        }
      }, 1000);
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

  const loadNext = () => {
    setCurrentQuestion(null);
  }

  const handleSubmit = () => {
    sessionStorage.setItem("studentName", name);
    socket.emit("student-set-name", { name });
    setShowQuestion(true);
  };

  const handlePoling = () => {
    if (selectedOption) {
      socket.emit("handle-polling", {
        option: selectedOption.text,
      });
      setVotingValidation(true);
    }
  };

  useEffect(() => {
    const found = connectedStudents
      ? connectedStudents.find((data) => data.socketId === socket.id)
      : undefined;
    if (found) {
      setVotingValidation(found.voted);
    }
  }, [connectedStudents]);

  const prepareChart = () => {
    const labels = Object.keys(currentQuestion.optionsFrequency);
    const values = labels.map(opt => parseInt(currentQuestion.results[opt] ?? 0, 10));

    return {
      data: {
        labels,
        datasets: [{
          label: 'Votes (%)',
          data: values,
          backgroundColor: labels.map((_, idx) => `hsl(${(idx * 60) % 360}, 70%, 55%)`),
          borderRadius: 6,
          barPercentage: 0.6,
        }],
      },
      options: {
        indexAxis: 'x',
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: '#ffffff',
              font: { size: 14, weight: 'bold' },
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            title: {
              display: true,
              text: '%',
              color: '#ffffff',
              font: { size: 14, weight: 'bold' },
            },
          },
          x: {
            ticks: {
              color: '#ffffff',
              font: { size: 14, weight: 'bold' },
            },
          },
        },
        plugins: {
          legend: { display: false },
          datalabels: {
            color: '#ffffff',
            anchor: 'end',
            align: 'end',
            formatter: (v) => `${v}%`,
            font: { weight: 'bold', size: 12 },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.parsed.y}%`,
            },
            bodyColor: '#ffffff',
            backgroundColor: '#333333',
            titleColor: '#ffffff',
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      }
    };
  };

  return (
    <div className="flex justify-center w-full h-[100] p-40">
      {showQuestion && name ? (
        <div className="w-full">
          {currentQuestion ? (
            currentQuestion.answered === false && votingValidation === false ? (
              <div className="gap-y-4 gap-x-4 ml-0 md:ml-4 p-12">
                <div className="flex flex-col space-y-0 border border-[#AF8FF1] rounded-lg">
                  <div className="bg-gradient-to-r from-[#343434] to-[#6E6E6E] rounded-t-lg text-white p-3">
                    <h2 className="text-xl font-bold">Question: {currentQuestion.question}</h2>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-300">
                        Time left: <span className="font-bold">{timeLeft}s</span>
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg p-10">
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
                          <span
                            className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 text-white font-semibold rounded-full border"
                            style={{
                              backgroundColor: selectedOption?.text === option.text ? '#8F64E1' : '#D3D3D3',
                              borderColor: selectedOption?.text === option.text ? '#8F64E1' : '#D3D3D3',
                            }}
                          >
                            {index + 1}
                          </span>
                          <span className="flex-1">{option.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end w-full mt-10">
                  <button
                    className="h-10 bg-[#8F64E1] w-1/5 rounded-lg font-semibold hover:scale-105 transition-transform"
                    variant="primary"
                    onClick={handlePoling}
                    disabled={!selectedOption}
                  >
                    Submit
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center bg-white flex-col">
                <div className="p-4 bg-gradient-to-r from-[#343434] to-[#6E6E6E] border border-[#6edff6] rounded-lg max-w-lg w-full m-4">
                  <h2 className="flex items-center justify-center text-xl font-bold text-white mb-4">
                    <img src={tower} alt="Tower" width="20" className="mr-3" />
                    Live Results
                  </h2>
                  <div className="h-64">
                    <Bar {...prepareChart()} />
                  </div>
                </div>
                <button onClick={loadNext} className="
                    bg-white text-[#7451B6] font-bold
                    p-[10px] rounded-[11px] w-[169px] border border-[#7451B6]
                    hover:!bg-[#7451B6] hover:!text-white 
                    transition ml-12"  >
                      Next Question &rarr;
                    </button>
                <button
                  onClick={() => setShowChatPanel((prev) => !prev)}
                  className="fixed bottom-6 right-20 bg-[#4E377B] text-white p-3 rounded-full shadow-lg hover:bg-[#36285a] transition z-50"
                  aria-label="Toggle Chat"
                >
                  💬
                </button>

                {showChatPanel&&<ChatBox socket={socket} username={name} role="Teacher" />}
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
                    <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
              <button
                onClick={() => setShowChatPanel((prev) => !prev)}
                className="fixed bottom-6 right-20 bg-[#4E377B] text-white p-3 rounded-full shadow-lg hover:bg-[#36285a] transition z-50"
                aria-label="Toggle Chat"
              >
                💬
              </button>

              {showChatPanel&&<ChatBox socket={socket} username={name} role="Teacher" />}

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
            If you’re a student, you’ll submit answers, participate in live polls, and see how you compare.
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
          <button
            className="bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-white p-[10px] rounded-[11px] w-[233px] transition transform hover:scale-105 mt-10"
            onClick={handleSubmit}
          >
            Continue
          </button>
        </div>
      )}
      
    </div>
  );
};

export default Student;
