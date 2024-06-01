import React, { useEffect, useState } from 'react';
import axios from 'axios';
const Health = () => {
  const [status, setStatus] = useState('Loading...');
  useEffect(() => {
    const fetchHealthStatus = async () => {
      try {
        const response = await axios.get('http://www.cloudeof.com:3000/health');
        if (response.status === 200) {
          setStatus('Server is healthy');
        } else {
          setStatus('Server is not healthy');
        }
      } catch (error) {
        setStatus('Server is not healthy');
      }
    };
    fetchHealthStatus();
  }, []);
  return (
    <div className="health">
      <h2>Health Check</h2>
      <p>{status}</p>
    </div>
  );
}
export default Health;
