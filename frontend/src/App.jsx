import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Problems from './components/Problemslist';
import Problem from './components/Problem';
import Admin from './components/Admin';

function App() {
  return (
    <div className="App">
      <div className="content">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path='/problems' element={<Problems />} />
            <Route path='/problem/:id' element={<Problem/>} />
            <Route path='/admin' element={<Admin />} />
            <Route path="*" element={<h1> Page not found!</h1>} />
          </Routes>
        </Router>
      </div>
    </div>
  );
};

export default App;