import React, { useState, useEffect, useRef } from "react";

const ChatBox = ({ socket, username, role = "Student" }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.emit("get-chat-history");

    socket.on("chat-history", (history) => {
      setChatMessages(history);
    });

    socket.on("chat-message", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chat-history");
      socket.off("chat-message");
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendChatMessage = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    socket.emit("chat-message", {
      sender: `${username}`,
      message: trimmed,
    });
    setChatInput("");
  };

  return (
    <div className="fixed bottom-20 right-6 w-80 bg-white border border-gray-300 rounded-xl shadow-xl p-4 z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-black">Chat</h3>
        {/* Optional: Add a close button externally */}
      </div>

      <div className="text-black text-sm h-40 overflow-y-auto border p-2 mb-3 rounded bg-gray-50">
        {chatMessages.map((msg, i) => (
          <p key={i} className="mb-1">
            <strong>{msg.sender}:</strong> {msg.message}
          </p>
        ))}
        <div ref={bottomRef}></div>
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type your message..."
          className="w-full p-2 border border-gray-300 rounded text-black bg-white"
          onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
        />
        <button
          onClick={sendChatMessage}
          className="bg-[#4E377B] text-white px-3 py-1 rounded hover:bg-[#36285a]"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
