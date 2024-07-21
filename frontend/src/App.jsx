import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Problems from './components/Problemslist';
import Problem from './components/Problem';
import Admin from './components/Admin';
import Profile from './components/Profile';
import Submissions from './components/Submissions';
import UserProvider from './UserProvider';
import Contests from './components/Contests';
import ContestDetails from './components/ContestDetails';
import CreateContest from './components/CreateContest';
import ResultsPage from './components/ResultsPage';
import Navbar from './components/Navbar';
import ForgotPassword from './components/ForgotPassword';

import './App.css';

function App() {
  return (
    <div className="App">
               <UserProvider>
               <div className="content">
        <Router>
          <Navbar/>
            <div className="content">

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path='/problems' element={<Problems/>} />
                <Route path='/problem/:id' element={<Problem/>} />
                <Route path='/admin' element={<Admin />} />
                <Route path='/profile' element={<Profile/>}/>
                <Route path='/submissions' element={<Submissions apiEndpoint='/submissions' title='Submissions'/>}/>
                <Route
                  path="/submissions/:problemId"
                  element={<Submissions apiEndpoint={`/submissions/:problemId`} title="My Submissions" />}
                />
                <Route
                  path="/contests/:contestId/submissions"
                  element={<Submissions apiEndpoint={`/contests/:contestId/submissions`} title="Contest Submissions" />}
                />
                <Route
                  path="/contests/:contestId/users/:userId/submissions"
                  element={<Submissions apiEndpoint={`/contests/:contestId/users/:userId/submissions`} title="My Submissions" />}
                />
                <Route path='/contests' element={<Contests/>}></Route>
                <Route path="/contests/:id" element={<ContestDetails />} />
                <Route path='/contests/:id/results' element={<ResultsPage/>}/>
                <Route path="/contest" element={<CreateContest />} />  
                <Route path="/forgotPassword" element={<ForgotPassword/>} />  
                <Route path="*" element={<h1> Page not found!</h1>} />
            </Routes>
          </div>
          </Router>
      </div>
      </UserProvider>
    </div>
  );
};

export default App;