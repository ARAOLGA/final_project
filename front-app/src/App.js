import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import AddTestCaseForm from './addTest/addTest.js';
import ButtonGroup from './main/button.js';
import HeaderBar from './header/headerBar.js'
import List from './testList/testList.js'
import Result from './result/result.js';
import Execute from './execute/execute.js';
import Logmsg from './logmsg/logmsg.js';
import Health from './health/health.js';
import './App.css';


const RouterComponent = () => {
  return (
    <div className='myApp'>
      <BrowserRouter>
        <HeaderBar />
        <Routes>
          <Route path="/" element={<ButtonGroup />} />
          <Route path="/add" element={<AddTestCaseForm />} />
          <Route path="/list" element={<List />} />
          <Route path="/result/:id" element={<Result />} />
          <Route path="/execute/:id" element={<Execute />} />
          <Route path="/log" element={<Logmsg />} />
          <Route path="/health" element={<Health />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default RouterComponent;
