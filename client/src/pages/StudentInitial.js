import React from 'react';
import IntervueLogo from "../Components/IntervueLogo";

const StudentInitial = () => {
    const [name, setName] = useState("");
    if (name) {
      setName(name);
      setShowQuestion(true);
      socket.emit("student-set-name", { name });
    }

    return (
        <div>
            <div>
                <IntervueLogo></IntervueLogo>
                <h2 className="text-black font-sora text-[40px] font-light">
                    Let’s <span className="font-normal">Get Started</span>
                </h2>
                <p className="font-">If you’re a student, you’ll be able to <span className="font-bold">submit your answers,</span> participate in live polls, and see how your responses compare with your classmates</p>
            </div>
            <div>
                <p>Enter your Name</p>
                <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-[45%] h-10 p-2.5 border border-[#0dcaf0] rounded-md bg-[#2a444a] outline-none text-[#F2F2F2]"
            />
            </div>

            </div>
        
    );
};

export default StudentInitial;