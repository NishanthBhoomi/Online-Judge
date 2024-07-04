import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Problems from './components/Problemslist';
import Problem from './components/Problem';
import Admin from './components/Admin';
import Profile from './components/Profile';
import Submissions from './components/Submissionlist';
import React, { useState, useEffect } from 'react';
import api from '../api';
export const Context=React.createContext();

function App() {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/profile');
        console.log('User response:', response.data);
        if (response.data.UserType === 'Admin') {
          setUser(response.data.user);
        } else {
          setUser(response.data.user);
        }
      } else {
        console.log('No token found in localStorage');
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      setUser(null);
    }
  };
  
  useEffect(() => {
    fetchUser();
  }, []);
  
  return (
    <Context.Provider value={{user, fetchUser }}>
    <div className="App">
      <div className="content">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path='/problems' element={<Problems/>} />
            <Route path='/problem/:id' element={<Problem/>} />
            <Route path='/admin' element={<Admin />} />
            <Route path='/profile' element={<Profile/>}/>
            <Route path='/submissions' element={<Submissions/>}></Route>
            <Route path="*" element={<h1> Page not found!</h1>} />
          </Routes>
        </Router>
      </div>
    </div>
    </Context.Provider>
  );
};

export default App;