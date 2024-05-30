// 차트 수정 예정 (지금은 같은 차트만 2개 나옴)

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Chart from 'chart.js/auto';
import './result.css';

const Result = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const rpsChartRefs = [useRef(null), useRef(null)];
  const responseTimeChartRefs = [useRef(null), useRef(null)];
  const numberOfUsersChartRefs = [useRef(null), useRef(null)];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/testcase/${id}/stats/`);
        
        setData(response.data);
        drawCharts(response.data);
      } catch (error) {
        console.error('데이터를 불러오는 중 오류가 발생했습니다:', error);
      }
    };

    fetchData();

    return () => {
      // 컴포넌트가 언마운트될 때 차트를 제거합니다.
      rpsChartRefs.forEach(ref => ref.current && ref.current.destroy());
      responseTimeChartRefs.forEach(ref => ref.current && ref.current.destroy());
      numberOfUsersChartRefs.forEach(ref => ref.current && ref.current.destroy());
    };
  }, [id]);

  // 차트 그리는 함수
  const drawCharts = (data) => {
    const recordedTimes = data.map(row => new Date(row[6] * 1000).toISOString().substr(11, 8));
    const rpsValues = data.map(row => row[2]);
    const responseTimes = data.map(row => row[4]);
    const numberOfUsers = data.map(row => row[6]);

    // 기존 차트가 있으면 제거
    rpsChartRefs.forEach(ref => ref.current && ref.current.destroy());
    responseTimeChartRefs.forEach(ref => ref.current && ref.current.destroy());
    numberOfUsersChartRefs.forEach(ref => ref.current && ref.current.destroy());

    const createChart = (ctx, label, data, backgroundColor, borderColor) => {
      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: recordedTimes,
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

    rpsChartRefs.forEach((ref, idx) => {
      const ctx = document.getElementById(`rpsChart${idx + 1}`).getContext('2d');
      ref.current = createChart(ctx, 'RPS', rpsValues, 'rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 1)');
    });

    responseTimeChartRefs.forEach((ref, idx) => {
      const ctx = document.getElementById(`responseTimeChart${idx + 1}`).getContext('2d');
      ref.current = createChart(ctx, 'Response Time', responseTimes, 'rgba(54, 162, 235, 0.2)', 'rgba(54, 162, 235, 1)');
    });

    numberOfUsersChartRefs.forEach((ref, idx) => {
      const ctx = document.getElementById(`numberOfUsersChart${idx + 1}`).getContext('2d');
      ref.current = createChart(ctx, 'Number of Users', numberOfUsers, 'rgba(75, 192, 192, 0.2)', 'rgba(75, 192, 192, 1)');
    });
  };


  return (


    <div className="result">
      <h2>Incremental Data</h2>

      {/* 차트 컨테이너 */}
      <div className="charts-container" style={{width:'50vw', height:'50vh'}}>
        {/* RPS 차트 */}
        <canvas id="rpsChart1"></canvas>
        <canvas id="rpsChart2"></canvas>
        {/* Response Time 차트 */}
        <canvas id="responseTimeChart1"></canvas>
        <canvas id="responseTimeChart2"></canvas>
        {/* Number of Users 차트 */}
        <canvas id="numberOfUsersChart1"></canvas>
        <canvas id="numberOfUsersChart2"></canvas>



      </div>
    </div>
  );
}

export default Result;
