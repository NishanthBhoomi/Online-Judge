import { useState, useEffect, useContext } from 'react';
import api from '../../api';
import { useNavigate } from "react-router-dom";
import './css/Contests.css';
import { Context } from "../UserProvider";

const Contests = () => {
    const { user } = useContext(Context);
    const [contests, setContests] = useState([]);
    const [selected, setSelected] = useState(null);
    const [isDelete, setIsDelete] = useState(false);
    const navigate = useNavigate();

    const fetchContests = async () => {
      try {
        const data = await api.get('/contests');
        const response = data.data;
        if (response) {
          setContests(response);
        } else {
          console.log("Error fetching contests: ", response.message);
        }
      } catch (error) {
        console.log("Error fetching contests", error);
      }
    };

    useEffect(() => {
      fetchContests();
    }, []);

    const handleContestClick = (id) => {
        navigate(`/contests/${id}`);
    };

    const DeleteClick = (contest) => {
      setSelected(contest);
      setIsDelete(true);
    };

    const DeleteSubmit = async () => {
      try {
        await api.delete(`/contests/${selected._id}`);
        setContests(contests.filter(c => c._id !== selected._id));
        setIsDelete(false);
      } catch (error) {
        console.log("Error deleting contest", error);
      }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        
        // Adjusting time to GMT+5:30
        const offset = 5.5 * 60; // 5 hours 30 minutes in minutes
        const localTime = date.getTime() - (offset * 60 * 1000);
        const localDate = new Date(localTime);

        const year = localDate.getFullYear();
        const month = localDate.getMonth() + 1; // Months are zero-indexed
        const day = localDate.getDate();
        const hours = localDate.getHours();
        const minutes = localDate.getMinutes();
        const seconds = localDate.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM/PM

        return `${day}/${month}/${year}, ${formattedHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
    };

    return (
        <div className="contests-container">
            <header className="contests-header">
                {user && user.isAdmin && (
                    <div className="contests-add-contest-container">
                        <button className="contests-add-contest-button" onClick={() => navigate('/contest')}>Add Contest</button>
                    </div>
                )}
                <h1>Contests</h1>
            </header>
            <table className="contests-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        {user && user.isAdmin && (
                            <th>Action</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {contests.map((contest, index) => (
                        <tr key={contest._id} onClick={() => handleContestClick(contest._id)} style={{ cursor: "pointer" }}>
                            <td>{index + 1}</td>
                            <td>{contest.title}</td>
                            <td>{contest.description}</td>
                            <td>{formatDate(contest.startTime)}</td>
                            <td>{formatDate(contest.endTime)}</td>
                            {user && user.isAdmin && (
                                <td>
                                    <button className='contests-delete-button' onClick={(e) => {
                                        e.stopPropagation();
                                        DeleteClick(contest);
                                    }}>Delete</button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            {isDelete && (
                <div className="contests-modal">
                    <div className="contests-modal-content">
                        <h2>Delete Contest</h2>
                        <p>Are you sure you want to delete this Contest?</p>
                        <div className="contests-button-group">
                            <button type='button' className="contests-yes-button" onClick={DeleteSubmit}>Yes</button>
                            <button type="button" className="contests-no-button" onClick={() => setIsDelete(false)}>No</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contests;
