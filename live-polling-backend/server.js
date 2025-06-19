const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const NodeCache = require("node-cache");

const memoryCache = new NodeCache({ stdTTL: 3600 });

let chatHistory = [];
let pollIndex = 0;

app.use(cors());
let currentTimer = null;

const __dirname1 = path.resolve(__dirname, "dist");
if (process.env.NODE_ENV === "production") {
  app.use(express.static(__dirname1));
  app.get("*", (req, res) => {
    const indexfile = path.join(__dirname, "dist", "index.html");
    return res.sendFile(indexfile);
  });
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

server.listen(3001, () => {
  console.log("Server is running on port 3001");
});

let currentQuestion = {};
const connectedStudents = new Map();

io.on("connection", (socket) => {
  socket.on("teacher-ask-question", (questionData) => {
    if (currentTimer) clearTimeout(currentTimer);

    const question = {
      question: questionData.question,
      options: questionData.options,
      optionsFrequency: {},
      answered: false,
      results: {},
      timer: questionData.timer,
    };

    questionData.options.forEach((opt) => {
      question.optionsFrequency[opt.text] = 0;
    });

    currentQuestion = question;

    connectedStudents.forEach((student) => {
      student.voted = false;
    });

    io.emit("student-connected", Array.from(connectedStudents.values()));
    io.emit("new-question", currentQuestion);

    currentTimer = setTimeout(() => handlePollCompletion(), question.timer * 1000);
  });

  socket.on("kick-student", (socketId) => {
    const student = connectedStudents.get(socketId);
    if (student) {
      io.to(socketId).disconnectSockets(true);
      connectedStudents.delete(socketId);
      io.emit("student-connected", Array.from(connectedStudents.values()));
    }
  });

  socket.on("chat-message", ({ sender, message }) => {
    const chatEntry = {
      sender,
      message,
      timestamp: new Date().toISOString(),
    };

    chatHistory.push(chatEntry);
    if (chatHistory.length > 100) chatHistory.shift();

    io.emit("chat-message", chatEntry);
  });

  socket.on("get-chat-history", () => {
    socket.emit("chat-history", chatHistory);
  });

  socket.on("get-previous-polls", () => {
    const polls = [];
    for (let i = 0; i < 10; i++) {
      const poll = memoryCache.get(`poll-${i}`);
      if (poll) polls.push(poll);
    }
    socket.emit("previous-polls", polls);
  });

  socket.on("handle-polling", ({ option }) => {
    const student = connectedStudents.get(socket.id);

    if (
      currentQuestion &&
      typeof option === "string" &&
      currentQuestion.optionsFrequency.hasOwnProperty(option)
    ) {
      if (student && !student.voted) {
        currentQuestion.optionsFrequency[option] += 1;

        student.voted = true;
        connectedStudents.set(socket.id, student);

        io.emit("student-vote-validation", Array.from(connectedStudents.values()));

        const totalVotes = Object.values(currentQuestion.optionsFrequency).reduce((a, b) => a + b, 0);
        Object.keys(currentQuestion.optionsFrequency).forEach((text) => {
          const count = currentQuestion.optionsFrequency[text];
          currentQuestion.results[text] = parseFloat(((count / totalVotes) * 100).toFixed(2));
        });

        io.emit("polling-results", currentQuestion.results);
        io.emit("new-question", currentQuestion);

        const allVoted = Array.from(connectedStudents.values()).every((s) => s.voted);
        if (allVoted) handlePollCompletion();
      } else {
        socket.emit("error-message", "You have already voted.");
      }
    } else {
      console.warn(`Invalid vote received from ${socket.id}:`, option);
    }
  });

  socket.on("student-set-name", ({ name }) => {
    const student = {
      name,
      socketId: socket.id,
      voted: false,
    };

    connectedStudents.set(socket.id, student);
    console.log(`Student ${name} connected`);

    io.emit("student-connected", Array.from(connectedStudents.values()));
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    connectedStudents.delete(socket.id);
    io.emit("student-disconnected", Array.from(connectedStudents.values()));
  });
});

function handlePollCompletion() {
  if (!currentQuestion.answered) {
    const totalVotes = Object.values(currentQuestion.optionsFrequency).reduce((a, b) => a + b, 0);

    if (totalVotes > 0) {
      Object.keys(currentQuestion.optionsFrequency).forEach((text) => {
        const count = currentQuestion.optionsFrequency[text];
        currentQuestion.results[text] = parseFloat(((count / totalVotes) * 100).toFixed(2));
      });
    } else {
      Object.keys(currentQuestion.optionsFrequency).forEach((text) => {
        currentQuestion.results[text] = 0;
      });
    }

    currentQuestion.answered = true;

    const completedPoll = {
      question: currentQuestion.question,
      options: currentQuestion.options,
      optionsFrequency: { ...currentQuestion.optionsFrequency },
      results: { ...currentQuestion.results },
      timestamp: new Date().toISOString(),
    };

    memoryCache.set(`poll-${pollIndex}`, completedPoll);
    pollIndex = (pollIndex + 1) % 10;

    io.emit("polling-results", currentQuestion.results);
    io.emit("new-question", currentQuestion);
  }
}
