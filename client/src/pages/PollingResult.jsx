import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import tower from "../assets/tower-icon.png";

Chart.register(ChartDataLabels);

const PollingResultChart = ({ socket }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);

  useEffect(() => {
    const handler = (q) => setCurrentQuestion(q);
    socket.on("new-question", handler);
    return () => socket.off("new-question", handler);
  }, [socket]);

  if (!currentQuestion) return <div className="text-[#F2F2F2] text-xl">Waiting for question...</div>;

  const labels = Object.keys(currentQuestion.optionsFrequency);
  const dataValues = labels.map((opt) => parseInt(currentQuestion.results[opt] ?? 0, 10));

  const data = {
    labels,
    datasets: [
      {
        label: "Votes (%)",
        data: dataValues,
        backgroundColor: '#7451B6',
        borderRadius: 10,
        barPercentage: 0.6,
      },
    ],
  };

  const options = {
    indexAxis: "x",
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: "#e0e0e0",
          font: { size: 14, weight: 'bold' },
        },
        grid: {
          color: "rgba(255,255,255,0.1)",
        },
      },
      x: {
        ticks: {
          color: "#e0e0e0",
          font: { size: 14, weight: 'bold' },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y}%`,
        },
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        formatter: (val) => `${val}%`,
        font: { weight: 'bold', size: 14 },
        color: '#fff',
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div className="w-screen md:max-h-screen max-h-[570px] flex items-center justify-center p-4 bg-white mb-4 mt-20">
      <div className="shadow-2xl rounded-xl bg-gradient-to-r from-[#343434] to-[#6E6E6E] p-8 pb-2 max-w-2xl w-full border border-[#4fd1c5]">
        <h2 className="text-center flex justify-center items-center text-4xl font-extrabold mb-6 text-[#F2F2F2]">
          <img src={tower} alt="Tower" width="32" height="32" className="mr-3" />
          Live Results
        </h2>
        <div className="h-[60vh]">
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>

  );
};

export default PollingResultChart;
