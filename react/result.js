import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Chart from 'chart.js/auto';
import './result.css';

const Result = () => {
  const { id } = useParams();
  const test_id = id;
  const [data, setData] = useState([]);
  const preRpsChartRef = useRef(null);
  const currentRpsChartRef = useRef(null);
  const preResponseTimeChartRef = useRef(null);
  const currentResponseTimeChartRef = useRef(null);
  const preNumberOfUsersChartRef = useRef(null);
  const currentNumberOfUsersChartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pre_response = await axios.get(`http://localhost:8000/testcase/${test_id}/pre_stats/`);
        const current_response = await axios.get(`http://localhost:8000/testcase/${test_id}/stats/`);
        
        const mergedData = [pre_response.data, current_response.data];
        setData(mergedData);
        drawCharts(mergedData);
      } catch (error) {
        console.error('데이터를 불러오는 중 오류가 발생했습니다:', error);
      }
    };

    fetchData();

    return () => {
      // Clean up charts on unmount
      if (preRpsChartRef.current) preRpsChartRef.current.destroy();
      if (currentRpsChartRef.current) currentRpsChartRef.current.destroy();
      if (preResponseTimeChartRef.current) preResponseTimeChartRef.current.destroy();
      if (currentResponseTimeChartRef.current) currentResponseTimeChartRef.current.destroy();
      if (preNumberOfUsersChartRef.current) preNumberOfUsersChartRef.current.destroy();
      if (currentNumberOfUsersChartRef.current) currentNumberOfUsersChartRef.current.destroy();
    };
  }, [test_id]);

  const drawCharts = (mergedData) => {
    const preData = mergedData[0];
    const currentData = mergedData[1];

    const recordedTimes1 = preData.map(row => new Date(row[7] * 1000).toISOString().substr(11, 8));
    const recordedTimes2 = currentData.map(row => new Date(row[7] * 1000).toISOString().substr(11, 8));
    const rpsValues1 = preData.map(row => row[3]);
    const rpsValues2 = currentData.map(row => row[3]);
    const responseTimes1 = preData.map(row => row[5]);
    const responseTimes2 = currentData.map(row => row[5]);
    const numberOfUsers1 = preData.map(row => row[6]);
    const numberOfUsers2 = currentData.map(row => row[6]);

    const createChart = (ctx, labels, label, data, backgroundColor, borderColor) => {
      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: label,
            data: data,
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            xAxes: [{
              type: 'time',
              time: {
                unit: 'minute' // 시간 단위 설정 (분)
              }
            }],
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
    };
    // 과거 RPS
    if (preRpsChartRef.current) preRpsChartRef.current.destroy();
    preRpsChartRef.current = createChart(
      document.getElementById('preRpsChart').getContext('2d'), 
      recordedTimes1, 'Pre Test RPS', rpsValues1, 'rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 1)'
    );
    // 현재 RPS
    if (currentRpsChartRef.current) currentRpsChartRef.current.destroy();
    currentRpsChartRef.current = createChart(
      document.getElementById('currentRpsChart').getContext('2d'), 
      recordedTimes2, 'Current Test RPS', rpsValues2, 'rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 1)'
    );
    // 과거 평균 응답 시간
    if (preResponseTimeChartRef.current) preResponseTimeChartRef.current.destroy();
    preResponseTimeChartRef.current = createChart(
      document.getElementById('preResponseTimeChart').getContext('2d'), 
      recordedTimes1, 'Pre Test Response Time', responseTimes1, 'rgba(54, 162, 235, 0.2)', 'rgba(54, 162, 235, 1)'
    );
    // 현재 평균 응답 시간
    if (currentResponseTimeChartRef.current) currentResponseTimeChartRef.current.destroy();
    currentResponseTimeChartRef.current = createChart(
      document.getElementById('currentResponseTimeChart').getContext('2d'), 
      recordedTimes2, 'Current Test Response Time', responseTimes2, 'rgba(54, 162, 235, 0.2)', 'rgba(54, 162, 235, 1)'
    );
    // 과거 유저 수
    if (preNumberOfUsersChartRef.current) preNumberOfUsersChartRef.current.destroy();
    preNumberOfUsersChartRef.current = createChart(
      document.getElementById('preNumberOfUsersChart').getContext('2d'), 
      recordedTimes1, 'Pre Test Number of Users', numberOfUsers1, 'rgba(75, 192, 192, 0.2)', 'rgba(75, 192, 192, 1)'
    );
    // 현재 유저 수
    if (currentNumberOfUsersChartRef.current) currentNumberOfUsersChartRef.current.destroy();
    currentNumberOfUsersChartRef.current = createChart(
      document.getElementById('currentNumberOfUsersChart').getContext('2d'), 
      recordedTimes2, 'Current Test Number of Users', numberOfUsers2, 'rgba(75, 192, 192, 0.2)', 'rgba(75, 192, 192, 1)'
    );
  };

  return (
    <div className="result">
      <h2>Incremental Data</h2>

      {/* 차트 컨테이너 */}
      <div className="charts-container" style={{width:'50vw', height:'25vh'}}>
        {/* RPS 차트 */}
        <canvas id="preRpsChart"></canvas>
        <canvas id="currentRpsChart"></canvas>
        {/* Response Time 차트 */}
        <canvas id="preResponseTimeChart"></canvas>
        <canvas id="currentResponseTimeChart"></canvas>
        {/* Number of Users 차트 */}
        <canvas id="preNumberOfUsersChart"></canvas>
        <canvas id="currentNumberOfUsersChart"></canvas>
      </div>
    </div>
  );
};

export default Result;
