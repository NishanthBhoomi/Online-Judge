import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  return (
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/login" element={<Login/>}/> 
            <Route path="/register" element={<Register/>}/>
            <Route path="*" element={<h1> Page not found!</h1>}/>
          </Routes>
        </Router>
      </div>
  );
};

export default App;