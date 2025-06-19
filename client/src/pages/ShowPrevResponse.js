import React, { useEffect, useState,useContext } from "react";
import { SocketContext } from "../Context/SocketContext";

const ShowPrevResponse = () => {
    
const socket = useContext(SocketContext);


  const [previousPolls, setPreviousPolls] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("get-previous-polls");

    socket.on("previous-polls", (polls) => {
      setPreviousPolls(polls.reverse()); // most recent first
    });

    return () => {
      socket.off("previous-polls");
    };
  }, [socket]);

  return (
    <div className="p-4 max-w-4xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-[#4E377B]">Previous Polls</h2>

      {previousPolls.length === 0 ? (
        <p className="text-gray-500">No previous polls available.</p>
      ) : (
        <div className="space-y-6">
          {previousPolls.map((poll, index) => (
            <div key={index} className="border rounded-lg p-4 bg-[#F9F9FF]">
              <h3 className="text-lg font-semibold text-[#333] mb-2">{poll.question}</h3>
              <ul className="space-y-1">
                {poll.options.map((opt, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center bg-white px-3 py-2 rounded border"
                  >
                    <span className="text-gray-700">{opt.text}</span>
                    <span className="text-sm text-[#4E377B] font-medium">
                      {poll.results[opt.text] || 0}%
                    </span>
                  </li>
                ))}
              </ul>
              <div className="text-right text-xs text-gray-400 mt-2">
                {new Date(poll.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowPrevResponse;
