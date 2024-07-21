import { useState, useEffect, useContext } from 'react';
import api from '../../api';
import { useParams, useNavigate } from "react-router-dom";
import './css/ContestDetails.css';
import { Context } from "../UserProvider";

const ContestDetails = () => {
    const { user } = useContext(Context);
    const [contest, setContest] = useState({});
    const [problems, setProblems] = useState([]);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [isEditProblem, setIsEditProblem] = useState(false);
    const [isDeleteProblem, setIsDeleteProblem] = useState(false);
    const [isAddProblem, setIsAddProblem] = useState(false);
    const [isEditContest, setIsEditContest] = useState(false);
    const [editContestData, setEditContestData] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: ''
    });
    const [editData, setEditData] = useState({
        title: '',
        description: '',
        difficulty: '',
        constraints: '',
        timeConstraints: '',
        spaceConstraints: '',
        inputFormat: '',
        outputFormat: '',
        examples: [{ input: '', output: '' }],
        testcases: [{ input: '', output: '' }],
        score:''
    });
    const [newProblem, setNewProblem] = useState({
        title: '',
        description: '',
        difficulty: 'easy',
        constraints: '',
        timeConstraints: '',
        spaceConstraints: '',
        inputFormat: '',
        outputFormat: '',
        examples: [{ input: '', output: '' }],
        testcases: [{ input: '', output: '' }],
        score:''
    });
    const { id } = useParams();
    const navigate = useNavigate();
    const [timer, setTimer] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const [registrationError, setRegistrationError] = useState("");
    
    const checkRegistration = async () => {
        try {
            const response = await api.get(`/contests/${id}/isRegistered`);
            setIsRegistered(response.data.isRegistered);
        } catch (error) {
            console.error("Error checking registration:", error);
        }
    };

    const handleRegister = async () => {
        try {
            const now = new Date();
            const offset=5.5*60*60*1000;
            const startTime = new Date(contest.startTime).getTime()-offset;
            if (now.getTime() < startTime) {
                await api.post(`/contests/${id}/register`, {});
                setIsRegistered(true);
                alert('You have successfully registered for the contest');
                setRegistrationError("");
            }else{
                alert("Contest has already started. You cannot register now.");
            }
        } catch (error) {
            setRegistrationError("Registration failed. Please try again.");
            console.error("Error registering for contest:", error);
        }
    };
    
    const fetchContestDetails = async () => {
        try {
            const response = await api.get(`/contests/${id}`);
            setContest(response.data);
            const contestData=response.data;
            const problemIds=contestData.problems.map(p=>p.problem);

            if (problemIds && problemIds.length > 0) {
                const problemsResponse = await Promise.all(
                    problemIds.map((problemId) => api.get(`/problem/${problemId}`))
                );
                const problemsData = problemsResponse.map((res, index) => ({
                    ...res.data,
                    score: contestData.problems[index].score
                }));
                setProblems(problemsData);
            } else {
                setProblems([]);
            }
        } catch (error) {
            console.error("Error fetching contest details:", error);
        }
    };

    useEffect(() => {
        fetchContestDetails();
    }, [id,contest.endTime,contest.startTime]);

    useEffect(() => {
        fetchContestDetails();
        if (user && user.isAdmin) {
            setIsRegistered(true); 
        }
        else if(user) {
            checkRegistration();
        }
        
    }, [id, user]);
    

    useEffect(() => {
        const updateTimer = () => {
            if (contest) {
                const now = new Date();
                const startTime = new Date(contest.startTime);
                const endTime = new Date(contest.endTime);
                const offset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
                const localStartTime = new Date(startTime.getTime() - offset);
                const localEndTime = new Date(endTime.getTime() - offset);
                if (now < localStartTime) {
                    const diff = localStartTime - now;
                    setTimer(`Starts in ${Math.floor(diff / (1000 * 60 * 60 * 24))} days ${Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))} hours ${Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))} minutes ${Math.floor((diff % (1000 * 60)) / 1000)} seconds`);
                } else if (now >= localStartTime && now <= localEndTime) {
                    const diff = localEndTime - now;
                    setTimer(`Ends in ${Math.floor(diff / (1000 * 60 * 60 * 24))} days ${Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))} hours ${Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))} minutes ${Math.floor((diff % (1000 * 60)) / 1000)} seconds`);
                } else {
                    setTimer('Contest Ended');
                }
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [contest]);


    const handleProblemClick = (problemId) => {
        const now = new Date();
        const offset=5.5*60*60*1000;
        const startTime = new Date(contest.startTime).getTime()-offset;
        const endTime = new Date(contest.endTime).getTime()-offset;

        if(user && !user.isAdmin){
            if (now.getTime() >= startTime && now.getTime() <= endTime && !isRegistered) {
                alert("You need to register for the contest to view the problems.");
                return;
            }
            if(now.getTime()<startTime){
                alert("Contest has not started yet.");
                return;
            }
        }

        const contestId=id;
        navigate(`/problem/${problemId}`,{state:{contestId}});
    };

    const handleEditProblemClick = (problem) => {
        setSelectedProblem(problem);
        setEditData({
            title: problem.title,
            difficulty: problem.difficulty,
            description: problem.description,
            constraints: problem.constraints,
            timeConstraints: problem.timeConstraints,
            spaceConstraints: problem.spaceConstraints,
            inputFormat: problem.inputFormat,
            outputFormat: problem.outputFormat,
            examples: problem.examples,
            testcases: problem.testcases,
            score:problem.score
        });
        setIsEditProblem(true);
    };

    const handleDeleteProblemClick = (problem) => {
        setSelectedProblem(problem);
        setIsDeleteProblem(true);
    };

    const handleAddProblemClick = () => {
        setIsAddProblem(true);
    };

    const handleEditChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleAddProblemChange = (e) => {
        const { name, value } = e.target;
        setNewProblem((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddExampleChange = (e, index) => {
        const { name, value } = e.target;
        const newExamples = [...newProblem.examples];
        newExamples[index][name] = value;
        setNewProblem((prev) => ({
            ...prev,
            examples: newExamples,
        }));
    };

    const addExample = () => {
        setNewProblem((prev) => ({
            ...prev,
            examples: [...prev.examples, { input: '', output: '' }],
        }));
    };

    const removeExample = (index) => {
        setNewProblem((prev) => ({
            ...prev,
            examples: prev.examples.filter((_, i) => i !== index),
        }));
    };

    const handleTestcaseChange = (e, index) => {
        const { name, value } = e.target;
        const newTestcases = [...newProblem.testcases];
        newTestcases[index][name] = value;
        setNewProblem((prev) => ({
            ...prev,
            testcases: newTestcases,
        }));
    };

    const addTestcase = () => {
        setNewProblem((prev) => ({
            ...prev,
            testcases: [...prev.testcases, { input: '', output: '' }],
        }));
    };

    const removeTestcase = (index) => {
        setNewProblem((prev) => ({
            ...prev,
            testcases: prev.testcases.filter((_, i) => i !== index),
        }));
    };

    const handleArrayChange = (index, arrayName, field, value) => {
        const newArray = [...editData[arrayName]];
        newArray[index][field] = value;
        setEditData({ ...editData, [arrayName]: newArray });
    };

    const handleArrayAdd = (arrayName) => {
        setEditData({ ...editData, [arrayName]: [...editData[arrayName], { input: '', output: '' }] });
    };

    const handleArrayRemove = (index, arrayName) => {
        const newArray = editData[arrayName].filter((_, i) => i !== index);
        setEditData({ ...editData, [arrayName]: newArray });
    };

    const editContestProblem = async () => {
        try {
            const updatedProblems = problems.map(p =>
                p._id === selectedProblem._id ? { ...p, ...editData } : p
            );
            await api.put(`/problem/${selectedProblem._id}`, editData);
            const updatedContestProblems = updatedProblems.map(p => ({ problem: p._id, score: p.score }));
    
            await api.put(`/contests/${id}`, { problems: updatedContestProblems });
    
            setProblems(updatedProblems);
            setContest({ ...contest, problems: updatedContestProblems });
    
            setIsEditProblem(false);
        } catch (error) {
            console.log("Couldn't update contest problems", error);
        }
    };
    
    
    const deleteProblemSubmit = async () => {
        try {
            setProblems(problems.filter(p => p._id !== selectedProblem._id));
            await api.put(`/contests/${id}`, { problems: contest.problems.filter(p => p.problem !== selectedProblem._id) });
            const problemId=selectedProblem._id;
            await api.delete(`/contests/${id}/submissions/${problemId}`);
            setContest({ ...contest, problems: contest.problems.filter(p => p.problem !== selectedProblem._id) });
            setIsDeleteProblem(false);
        } catch (error) {
            console.error("Error deleting problem:", error);
        }
    };

    const addProblemSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/problem', newProblem);
            setProblems([...problems, response.data]);
            const problemId = response.data._id;
            const updatedContest = {
                ...contest,
                problems: [...contest.problems, { problem: problemId, score: newProblem.score }]
            };
            await api.put(`/contests/${id}`, updatedContest);
            fetchContestDetails();
            setNewProblem({
                title: '',
                description: '',
                difficulty: 'easy',
                constraints: '',
                timeConstraints: '',
                spaceConstraints: '',
                inputFormat: '',
                outputFormat: '',
                examples: [{ input: '', output: '' }],
                testcases: [{ input: '', output: '' }],
                score:''
            });
            setIsAddProblem(false);
        } catch (error) {
            console.error('Error adding problem:', error);
        }
    };

    const handleEditContestClick = () => {
        setEditContestData({
            title: contest.title,
            description: contest.description,
            startTime: contest.startTime,
            endTime: contest.endTime
        });
        setIsEditContest(true);
    };
    
    const handleEditContestChange = (e) => {
        setEditContestData({ ...editContestData, [e.target.name]: e.target.value });
    };

    const editContestSubmit = async () => {
        try {
            await api.put(`/contests/${id}`, editContestData);
            setContest({ ...contest, ...editContestData });
            setIsEditContest(false);
        } catch (error) {
            console.error("Error updating contest:", error);
        }
    };

    const formatDateTimeLocal = (date) => {
        const pad = (num) => num.toString().padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1); // Months are zero-indexed
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
    
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    
    const handleStartTimeChange = (e) => {
        const newStartTime = new Date(e.target.value);
        
        // Apply the GMT+5:30 offset
        const offset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
        const adjustedNewStartTime = new Date(newStartTime.getTime());
        
        if (editContestData.endTime !== '') {
            const endTime = new Date(editContestData.endTime);
            const adjustedEndTime = new Date(endTime.getTime() - offset);
            
            if (adjustedNewStartTime > adjustedEndTime) {
                alert("Start time must be less than or equal to end time.");
                return;
            }
        }
        
        setEditContestData(prevData => ({ ...prevData, startTime: formatDateTimeLocal(newStartTime) }));
    };
    
    
    const handleEndTimeChange = (e) => {
        const newEndTime = new Date(e.target.value);

        const offset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
        const adjustedNewEndTime = new Date(newEndTime.getTime());
        
        if(editContestData.startTime !== ''){
            const startTime = new Date(editContestData.startTime);
            const adjustedStartTime = new Date(startTime.getTime() - offset);
            
            if (adjustedStartTime > adjustedNewEndTime) {
                alert("End time must be greater than or equal to start time.");
                return;
            }
        }

        setEditContestData(prevData => ({ ...prevData, endTime: formatDateTimeLocal(newEndTime) }));
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
        <div className="contest-details-container">
            <header className="contest-details-header">
                <h1>{contest.title}</h1>
                <p><strong>Description: </strong>{contest.description}</p>
                <p><strong>Start Time: </strong>{contest && formatDate(contest.startTime)} IST</p>
                <p><strong>End Time: </strong>{contest && formatDate(contest.endTime)} IST</p>
                <p>{timer}</p>

                {user && user.isAdmin && (
                    <>
                    <button className="contest-add-problem-button" onClick={handleAddProblemClick}>Add Problem</button>
                    <button className="contest-edit-button" onClick={handleEditContestClick}>Edit Contest</button>
                    </>
                )}
                {user && !user.isAdmin && !isRegistered && 
                    new Date() < new Date(new Date(contest.startTime).getTime() - (5.5 * 60 * 60 * 1000)) && (
                    <button onClick={handleRegister}>Register for Contest</button>
                )}
                {registrationError && <p className="registration-error">{registrationError}</p>}

                <button onClick={()=>{navigate(`/contests/${id}/submissions`)}}>View All Submissions</button>
                <button onClick={()=>{navigate(`/contests/${id}/users/${user._id}/submissions`)}}>My Submissions</button>
                <button onClick={()=>{navigate(`/contests/${id}/results`)}}>View Results</button>
            </header>
            <table className="contest-details-problems-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Score</th>
                        <th>Difficulty</th>
                        {user && user.isAdmin && (
                            <th>Actions</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {problems.map((problem, index) => (
                        <tr key={problem._id} onClick={() => handleProblemClick(problem._id)} style={{ cursor: 'pointer' }}>
                            
                            <td>{index + 1}</td>
                            <td>{problem.title}</td>
                            <td>{problem.score}</td>
                            <td>{problem.difficulty}</td>
                            {user && user.isAdmin && (
                                <td>
                                    <button className='contest-edit-button' onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditProblemClick(problem);
                                    }}>Edit</button>
                                    <button className='contest-delete-button' onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteProblemClick(problem);
                                    }}>Delete</button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            {isEditContest && (
            <div className="contest-details-modal">
                <div className="contest-details-modal-content">
                    <h2>Edit Contest</h2>
                    <form className='contest-details-edit-form'>
                        <label><h4>Title:</h4></label>
                        <input type="text" name="title" value={editContestData.title} onChange={handleEditContestChange} />
                        <label><h4>Description:</h4></label>
                        <textarea name="description" value={editContestData.description} onChange={handleEditContestChange} />
                        <label><h4>Start Time:</h4></label>
                        <input type="datetime-local" name="startTime" value={editContestData.startTime} onChange={handleStartTimeChange} />
                        <label><h4>End Time:</h4></label>
                        <input type="datetime-local" name="endTime" value={editContestData.endTime} onChange={handleEndTimeChange} />
                        <button type="button" className="button save-button" onClick={editContestSubmit}>Save Changes</button>
                        <button type="button" className="button cancel-button" onClick={() => setIsEditContest(false)}>Cancel</button>
                    </form>
                </div>
            </div>
            )}
            {isEditProblem && (
                <div className="problemlist-modal">
                    <div className="problemlist-modal-content">
                        <h1>Edit Problem</h1>
                        <form className='problemlist-edit-form'>
                            <label><h4>Title: </h4></label>
                            <input type="text" name="title"
                            value={editData.title} onChange={handleEditChange} />
                            <label><h4>Description: </h4></label>
                            <textarea name="description" value={editData.description} onChange={handleEditChange} />
                            <label><h4>Difficulty: </h4></label>
                            <select name="difficulty" value={editData.difficulty} onChange={handleEditChange}>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                            <label><h4>Constraints: </h4></label>
                            <textarea name="constraints" value={editData.constraints} onChange={handleEditChange} />
                            <label><h4>Time Constraints: </h4></label>
                            <input type="text" name="timeConstraints" value={editData.timeConstraints} onChange={handleEditChange} />
                            <label><h4>Space Constraints: </h4></label>
                            <input type="text" name="spaceConstraints" value={editData.spaceConstraints} onChange={handleEditChange} />
                            <label><h4>Input Format: </h4></label>
                            <textarea name="inputFormat" value={editData.inputFormat} onChange={handleEditChange} />
                            <label><h4>Output Format: </h4></label>
                            <textarea name="outputFormat" value={editData.outputFormat} onChange={handleEditChange} />

                            <h2>Examples</h2>
                            {editData.examples.map((example, index) => (
                                <div key={index} className="problemlist-example-input">
                                    <label><strong>Example {index + 1} </strong></label>
                                    <input name="input" value={example.input} onChange={(e) => handleArrayChange(index, 'examples', 'input', e.target.value)}/> <br />
                                    <input name="output" value={example.output} onChange={(e) => handleArrayChange(index, 'examples', 'output', e.target.value)}/>
                                    <button type="button" className="problemlist-remove-button" onClick={() => handleArrayRemove(index, 'examples')}>Remove Example</button>
                                </div>
                            ))}
                            <button type="button" className="problemlist-add-button" onClick={() => handleArrayAdd('examples')}>Add Example</button>

                            <h2>Test Cases</h2>
                            {editData.testcases.map((testcase, index) => (
                                <div key={index} className="problemlist-testcase-input">
                                    <label><strong>Test Case {index + 1} </strong></label><br />
                                    <input name="input" value={testcase.input} onChange={(e) => handleArrayChange(index, 'testcases', 'input', e.target.value)}/> <br />
                                    <input name="output" value={testcase.output} onChange={(e) => handleArrayChange(index, 'testcases', 'output', e.target.value)}/>
                                    <button type="button" className="problemlist-remove-button" onClick={() => handleArrayRemove(index, 'testcases')}>Remove Test Case</button>
                                </div>
                            ))}
                            <button type="button" className="problemlist-add-button" onClick={() => handleArrayAdd('testcases')}>Add Test Case</button>
                            <br /> <br />
                            <label><h4>Score: </h4></label>
                            <input type="number" name="score" value={editData.score} onChange={handleEditChange} />
                            
                            <div className='problemlist-button-group'>
                                <button type="button" className='problemlist-submit-button' onClick={editContestProblem}>Submit</button>
                                <button type="button" className='problemlist-close-button' onClick={() => setIsEditProblem(false)}>Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteProblem && (
                <div className="problemlist-modal">
                    <div className="problemlist-modal-content">
                        <h1>Delete Problem</h1> 
                        <h2>Are you sure you want to delete this problem?</h2>
                        <div className="problemlist-button-group">
                            <button type="button" className="problemlist-yes-button" onClick={deleteProblemSubmit}>Yes</button>
                            <button type="button" className="problemlist-no-button" onClick={() => setIsDeleteProblem(false)}>No</button>
                        </div>
                    </div>
                </div>
            )}

            {isAddProblem && (
                <div className="problemlist-modal">
                    <div className="problemlist-modal-content">
                        <h2>Add New Problem</h2>
                        <form className='problemlist-add-form' onSubmit={addProblemSubmit}>
                            <label><h4>Title: </h4></label>
                            <input type="text" name="title" value={newProblem.title} onChange={handleAddProblemChange} />
                            <label><h4>Description: </h4></label>
                            <textarea name="description" value={newProblem.description} onChange={handleAddProblemChange} />
                            <label><h4>Difficulty: </h4></label>
                            <select name="difficulty" value={newProblem.difficulty} onChange={handleAddProblemChange}>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                            <label><h4>Constraints: </h4></label>
                            <textarea name="constraints" value={newProblem.constraints} onChange={handleAddProblemChange} />
                            <label><h4>Time Constraints: </h4></label>
                            <input type="text" name="timeConstraints" value={newProblem.timeConstraints} onChange={handleAddProblemChange} />
                            <label><h4>Space Constraints: </h4></label>
                            <input type="text" name="spaceConstraints" value={newProblem.spaceConstraints} onChange={handleAddProblemChange} />
                            <label><h4>Input Format: </h4></label>
                            <textarea name="inputFormat" value={newProblem.inputFormat} onChange={handleAddProblemChange} />
                            <label><h4>Output Format: </h4></label>
                            <textarea name="outputFormat" value={newProblem.outputFormat} onChange={handleAddProblemChange} />

                            <h2>Examples</h2>
                            {newProblem.examples.map((example, index) => (
                                <div key={index} className="problemlist-example-input">
                                <label><strong>Example {index+1}</strong></label><br />
                                <input type="text" name="input" value={example.input} onChange={(e) => handleAddExampleChange(e, index)} placeholder="Example Input" />
                                <input type="text" name="output" value={example.output} onChange={(e) => handleAddExampleChange(e, index)} placeholder="Example Output" />
                                <button type="button" className="problemlist-remove-button" onClick={() => removeExample(index)}>Remove Example</button>
                            </div>
                            ))}
                            <button type="button" className="problemlist-add-button" onClick={addExample}>Add Example</button>

                            <h2>Testcases:</h2>
                            {newProblem.testcases.map((testcase, index) => (
                              <div key={index} className="problemlist-testcase-input">
                                <label><strong>Testcase {index+1}</strong></label><br />
                                <input type="text" name="input" value={testcase.input} onChange={(e) => handleTestcaseChange(e, index)} placeholder="Testcase Input" />
                                <input type="text" name="output" value={testcase.output} onChange={(e) => handleTestcaseChange(e, index)} placeholder="Testcase Output" />
                                <button type="button" className="problemlist-remove-button" onClick={() => removeTestcase(index)}>Remove Test Case</button>
                              </div>
                            ))}
                            <button type="button" className="problemlist-add-button" onClick={addTestcase}>Add Testcase</button>
                            <br /> <br />
                            <label><h4>Score: </h4></label>
                            <input type="number" name="score" value={newProblem.score} onChange={handleAddProblemChange} />                 
                            
                            <div className="problemlist-button-group">
                                <button type="submit" className="problemlist-submit-button">Add Problem</button>
                                <button type="button" className="problemlist-close-button" onClick={() => setIsAddProblem(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContestDetails;                            