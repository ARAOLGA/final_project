// execute.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './execute.css';

const Execute = () => {
  const { id } = useParams();
  const [testData, setTestData] = useState(null);
  useEffect(() => {
    const executeTest = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/testcase/${id}/execute/`);
        setTestData(response.data);
      } catch (error) {
        console.error('Error executing test:', error);
      }
    };

    executeTest();
  }, [id]);

  return (
    <div className="Execute">
      <h2>Executing Test</h2>
      {testData ? (
        <div className="test-details">
          <p>Test ID: {testData.test_id}</p>
          <p>Test Name: {testData.test_name}</p>
          <p>Target URL: {testData.target_url}</p>
          <p>User Number: {testData.user_num}</p>
          <p>User Plus Number: {testData.user_plus_num}</p>
          <p>Interval Time: {testData.interval_time}</p>
          <p>Plus Count: {testData.plus_count}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Execute;
