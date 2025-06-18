const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

app.use(cors());

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
    // Receive full option objects
    const question = {
      question: questionData.question,
      options: questionData.options, // [{ text: 'Yes', isyes: true }, ...]
      optionsFrequency: {},
      answered: false,
      results: {},
      timer: questionData.timer,
    };

    // Initialize frequency using text only
    questionData.options.forEach((opt) => {
      question.optionsFrequency[opt.text] = 0;
    });

    currentQuestion = question;

    io.emit("new-question", currentQuestion);

    // Auto-end poll after timer
    setTimeout(() => {
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

        io.emit("polling-results", currentQuestion.results);
        io.emit("new-question", currentQuestion); // Optional UI sync
      }
    }, question.timer * 1000);
  });

  socket.on("handle-polling", ({ option }) => {
    if (
      currentQuestion &&
      typeof option === "string" &&
      currentQuestion.optionsFrequency.hasOwnProperty(option)
    ) {
      currentQuestion.optionsFrequency[option] += 1;

      const totalVotes = Object.values(currentQuestion.optionsFrequency).reduce((a, b) => a + b, 0);

      Object.keys(currentQuestion.optionsFrequency).forEach((text) => {
        const count = currentQuestion.optionsFrequency[text];
        currentQuestion.results[text] = parseFloat(((count / totalVotes) * 100).toFixed(2));
      });

      currentQuestion.answered = true;

      const student = connectedStudents.get(socket.id);
      if (student) {
        student.voted = true;
        connectedStudents.set(socket.id, student);
        io.emit("student-vote-validation", Array.from(connectedStudents.values()));
      }

      io.emit("polling-results", currentQuestion.results);
      io.emit("new-question", currentQuestion); // Sync results to all
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
