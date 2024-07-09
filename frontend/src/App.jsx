import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Problems from './components/Problemslist';
import Problem from './components/Problem';
import Admin from './components/Admin';
import Profile from './components/Profile';
import Submissions from './components/Submissions';
import SubmissionsbyId from './components/SubmissionsbyId';
import UserProvider from './UserProvider';
import Contests from './components/Contests';
import ContestDetails from './components/ContestDetails';
import CreateContest from './components/CreateContest';

function App() {
  return (
    <div className="App">
      <div className="content">
        <Router>
          <UserProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path='/problems' element={<Problems/>} />
              <Route path='/problem/:id' element={<Problem/>} />
              <Route path='/admin' element={<Admin />} />
              <Route path='/profile' element={<Profile/>}/>
              <Route path='/submissions' element={<Submissions/>}></Route>
              <Route path='/submissions/:problemId' element={<SubmissionsbyId/>}></Route>
              <Route path='/contests' element={<Contests/>}></Route>
              <Route path="/contests/:id" element={<ContestDetails />} />
              <Route path="/contest" element={<CreateContest />} />  
              <Route path="*" element={<h1> Page not found!</h1>} />
            </Routes>
          </UserProvider>
        </Router>
      </div>
    </div>
  );
};

export default App;