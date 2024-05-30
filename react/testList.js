import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './testList.css';

const List = () => {
  const [tests, setTests] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get('http://localhost:8000/testcase');
        const data = response.data.map(([id, target_url, test_name, user_num, user_plus_num, interval_time, plus_count]) => ({
          id,
          target_url,
          test_name,
          user_num,
          user_plus_num,
          interval_time,
          plus_count
        }));
        setTests(data);
      } catch (error) {
        console.error('Error fetching test cases:', error);
      }
    };

    fetchTests();
  }, []);

  const handleToggleDetail = (index) => {
    setExpandedIndex(prevIndex => (prevIndex === index ? null : index));
  };

  const handleDelete = async (index) => {
    const testToDelete = tests[index];
    const confirmed = window.confirm(`${testToDelete.test_name}을(를) 정말 삭제하시겠습니까?`); // 확인 메시지 창

    if (confirmed) {
      try {
        const idToDelete = testToDelete.id;
        await axios.delete(`http://localhost:8000/testcase/${idToDelete}`);
        const newTests = tests.filter((_, i) => i !== index);
        setTests(newTests);
      } catch (error) {
        console.error('Error deleting test case:', error);
      }
    }
  };

  const handleRun = (id, event) => {
    event.stopPropagation();
    navigate(`/execute/${id}`);
  };

  const handleResult = (id, event) => {
    event.stopPropagation();
    navigate(`/result/${id}`);
  };

  return (
    <div className="List">
      <div className="list-page-title"><h2>Test Case List</h2></div>
      {tests.map((test, index) => (
        <div className="test-case" key={test.id} onClick={() => handleToggleDetail(index)}>
          <div className="test-info">
            <div className="test-name">{test.test_name}</div>
            <div className="test-url">{test.target_url}</div>
            <div className="test-actions">
              <button onClick={(e) => { e.stopPropagation(); handleDelete(index); }}>삭제</button>
              <button onClick={(e) => { e.stopPropagation(); handleRun(test.id, e); }}>실행</button>
              <button onClick={(e) => handleResult(test.id, e)}>결과</button>
            </div>
          </div>
          {expandedIndex === index && (
            <div className="test-details">
              <p>초기 유저 수 : {test.user_num}</p>
              <p>증가 유저 수 : {test.user_plus_num}</p>
              <p>증가 간격 : {test.interval_time}</p>
              <p>증가 횟수 : {test.plus_count}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default List;
