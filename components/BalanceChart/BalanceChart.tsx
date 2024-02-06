"use client";

import React, { useEffect, useState } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getDaysInMonth, getMonthNames } from "@/utils/date";
import {
  FinanceSourceHistory,
  Transaction,
  TransactionType,
} from "@prisma/client";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      // text: "",
    },
  },
};

const labels = [...getMonthNames()];

const getChartLabelsForMonthView = () => {
  return getDaysInMonth(new Date().getFullYear(), new Date().getMonth() + 1);
};

const generateChartDataForMonth = (
  balances: FinanceSourceHistory[],
  precedingBalance: FinanceSourceHistory | null
) => {
  const values: (number | undefined)[] = [...getChartLabelsForMonthView()].map(
    () => undefined
  );

  // Set balances per each day based on the history
  balances.forEach((balance) => {
    // TODO - handle multiple transactions per day
    // IF there is another balance data for the same day AND it has createdAt bigger than already set THEN replace it
    const day = new Date(balance.transaction.date).getDate();

    values[day - 1] = balance.balance;
  });

  // Fill gaps with last known value
  let lastValue = 0;

  for (let i = 0; i < values.length; i++) {
    const value = values[i];

    if (typeof value === "undefined") {
      if (i === 0 && precedingBalance) {
        values[i] = precedingBalance.balance;
      } else {
        values[i] = lastValue;
      }
    } else {
      lastValue = value;
    }
  }

  return values;
};

const BalanceChart = () => {
  const [chartData, setChartData] = useState();
  const [chartLabels, setChartLabels] = useState(getChartLabelsForMonthView());

  useEffect(() => {
    const fetchBalanceData = async () => {
      // const balanceResponse = await fetch("http://localhost:3000/api/balance");
      // const balanceData = await balanceResponse.json();

      const balanceResponse = await fetch("http://localhost:3000/api/balance");
      const balanceData = await balanceResponse.json();

      console.log({ balanceData });

      const data = {
        labels: chartLabels,
        datasets: [
          {
            label: "Balance trend",
            data: generateChartDataForMonth(
              balanceData.balances,
              balanceData.precedingBalance
            ),
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
          },
        ],
      };

      setChartData(data);
    };

    fetchBalanceData();
  }, [chartLabels]);

  return <div>{chartData && <Line data={chartData} options={options} />}</div>;
};

export default BalanceChart;
