import React, { useState } from 'react';
import './addTest.css'
import { Link } from 'react-router-dom';

const AddTestCaseForm = () => {
  const [formData, setFormData] = useState({
    target_url: '',
    test_name: '',
    user_num: '',
    user_plus_num: '',
    interval_time: '',
    plus_count: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    fetch('http://www.cloudeof.com:8000/testcase/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
      // 여기에 성공한 후의 동작을 추가하세요.
    })
    .catch(error => {
      console.error('Error:', error);
      // 여기에 오류 처리를 추가하세요.
    });
  };

  return (
    <div className="input_container">
      <div className="add-page-title"><h2>ADD TESTCASE</h2></div>
      <input type="text" name="target_url" value={formData.target_url} onChange={handleChange} placeholder="Target URL" />
      <input type="text" name="test_name" value={formData.test_name} onChange={handleChange} placeholder="Test Name" />
      <input type="number" name="user_num" value={formData.user_num} onChange={handleChange} placeholder="User Number" />
      <input type="number" name="user_plus_num" value={formData.user_plus_num} onChange={handleChange} placeholder="User Plus Number" />
      <input type="number" name="interval_time" value={formData.interval_time} onChange={handleChange} placeholder="Interval Time" />
      <input type="number" name="plus_count" value={formData.plus_count} onChange={handleChange} placeholder="Plus Count" />
      <Link to='/list'><button onClick={handleSubmit} className="submit_button">Submit</button></Link>
    </div>
  );
};

export default AddTestCaseForm;
