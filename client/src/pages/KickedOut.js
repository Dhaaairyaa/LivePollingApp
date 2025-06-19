import React from 'react';
import IntervueLogo from '../Components/IntervueLogo';

const KickedOut = () => {
    const handleClick = () => {
        window.location.href = "/";
    };
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center justify-center space-y-5 text-center">
            <IntervueLogo />
            <h2 className="text-[#000000] font-sora text-[40px] max-w-[737px]">
            You’ve been Kicked out!
            </h2>
            <p className="max-w-md text-gray-700">
            Looks like the teacher has removed you from the poll system. Please try again sometime.
            </p>

            <button
                    className="h-10 bg-gradient-to-r from-[#7565D9] to-[#4D0ACD]  w-1/5 rounded-lg font-semibold hover:scale-105 transition-transform"
                    variant="primary"
                    onClick={handleClick}
                  >
                    Try Again
            </button>
        </div>


    </div>

  );
};

export default KickedOut;