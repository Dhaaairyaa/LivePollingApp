import React from 'react';
import logo from "../assets/image-removebg-preview.png"
const IntervueLogo = () => {
  return (
    <div className="px-[9px] bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] rounded-[24px] w-[134px] h-[31px] pt-2">
      <div className="flex items-center justify-center h-full">
        <h2 className="text-[14px] font-sora text-white flex"><img src={logo} className="w-1/5"></img> Intervue Poll</h2>
      </div>
    </div>
  );
};

export default IntervueLogo;
