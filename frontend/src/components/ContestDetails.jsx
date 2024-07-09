import { useState, useEffect, useContext } from 'react';
import api from '../../api';
import { useParams, useNavigate } from "react-router-dom";
import './css/ContestDetails.css';
import { Context } from "../UserProvider";
import moment from 'moment-timezone';

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
        testcases: [{ input: '', output: '' }]
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
    });
    const { id } = useParams();
    const navigate = useNavigate();
    const [timer, setTimer] = useState('');
    const [submissions, setSubmissions] = useState([]);
    const [results, setResults] = useState([]);
    const [isViewSubmissions, setIsViewSubmissions] = useState(false);
    const [isViewResults, setIsViewResults] = useState(false);
    
    const fetchContestDetails = async () => {
        try {
            const response = await api.get(`/contests/${id}`);
            setContest(response.data);
            const contestData=response.data;
            const problemIds=contestData.problems;
            if (problemIds && problemIds.length > 0) {
                const problemsResponse = await Promise.all(
                    problemIds.map((problemId) => api.get(`/problem/${problemId}`))
                );
                const problemsData = problemsResponse.map((res) => res.data);
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
        navigate(`/problem/${problemId}`);
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
            testcases: problem.testcases
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

    const editProblemSubmit = async () => {
        try {
            await api.put(`/problem/${selectedProblem._id}`, editData);
            setProblems(problems.map(p => p._id === selectedProblem._id ? { ...p, ...editData } : p));
        } catch (error) {
            console.error("Error updating problem:", error);
        }
    };

    const editContestProblem = async () => {
        try {
            await api.put(`/contests/${id}`, { problems: problems.map(p => p._id) });
            setContest({ ...contest, problems: problems.map(p => p._id) });
            setIsEditProblem(false);
        } catch (error) {
            console.log("Couldn't update contest problems", error);
        }
    };

    const deleteProblemSubmit = async () => {
        try {
            setProblems(problems.filter(p => p._id !== selectedProblem._id));
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
            {contest ? (
                <>
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
            </header>
            {isEditContest && (
            <div className="contest-details-modal">
                <div className="contest-details-modal-content">
                    <h2>Edit Contest</h2>
                    <form className='contest-details-edit-form'>
                        <label>Title: </label>
                        <input type="text" name="title" value={editContestData.title} onChange={handleEditContestChange} />
                        <label>Description: </label>
                        <textarea name="description" value={editContestData.description} onChange={handleEditContestChange} />
                        <label>Start Time: </label>
                        <input type="datetime-local" name="startTime" value={editContestData.startTime} onChange={handleStartTimeChange} />
                        <label>End Time: </label>
                        <input type="datetime-local" name="endTime" value={editContestData.endTime} onChange={handleEndTimeChange} />
                        <button type="button" onClick={editContestSubmit}>Save Changes</button>
                        <button type="button" onClick={() => setIsEditContest(false)}>Cancel</button>
                    </form>
                </div>
            </div>
            )}
            <table className="contest-details-problems-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
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

            {isEditProblem && (
                <div className="contest-details-modal">
                    <div className="contest-details-modal-content">
                        <h2>Edit Problem</h2>
                        <form className='contest-details-edit-form'>
                            <label>Title: </label>
                            <input type="text" name="title"
                            value={editData.title} onChange={handleEditChange} />
                            <label>Description: </label>
                            <textarea name="description" value={editData.description} onChange={handleEditChange} />
                            <label>Difficulty: </label>
                            <select name="difficulty" value={editData.difficulty} onChange={handleEditChange}>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                            <label>Constraints: </label>
                            <textarea name="constraints" value={editData.constraints} onChange={handleEditChange} />
                            <label>Time Constraints: </label>
                            <input type="text" name="timeConstraints" value={editData.timeConstraints} onChange={handleEditChange} />
                            <label>Space Constraints: </label>
                            <input type="text" name="spaceConstraints" value={editData.spaceConstraints} onChange={handleEditChange} />
                            <label>Input Format: </label>
                            <textarea name="inputFormat" value={editData.inputFormat} onChange={handleEditChange} />
                            <label>Output Format: </label>
                            <textarea name="outputFormat" value={editData.outputFormat} onChange={handleEditChange} />

                            <h3>Examples</h3>
                            {editData.examples.map((example, index) => (
                                <div key={index} className="example-form-group">
                                    <label>Example {index + 1} Input :</label>
                                    <input
                                        name="input"
                                        value={example.input}
                                        onChange={(e) => handleArrayChange(index, 'examples', 'input', e.target.value)}
                                    /> <br />
                                    <label>Example {index + 1} Output: </label>
                                    <input
                                        name="output"
                                        value={example.output}
                                        onChange={(e) => handleArrayChange(index, 'examples', 'output', e.target.value)}
                                    />
                                    <button type="button" onClick={() => handleArrayRemove(index, 'examples')}>Remove Example</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => handleArrayAdd('examples')}>Add Example</button>

                            <h3>Test Cases</h3>
                            {editData.testcases.map((testcase, index) => (
                                <div key={index} className="testcase-form-group">
                                    <label>Test Case {index + 1} Input: </label>
                                    <input
                                        name="input"
                                        value={testcase.input}
                                        onChange={(e) => handleArrayChange(index, 'testcases', 'input', e.target.value)}
                                    /> <br />
                                    <label>Test Case {index + 1} Output: </label>
                                    <input
                                        name="output"
                                        value={testcase.output}
                                        onChange={(e) => handleArrayChange(index, 'testcases', 'output', e.target.value)}
                                    />
                                    <button type="button" onClick={() => handleArrayRemove(index, 'testcases')}>Remove Test Case</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => handleArrayAdd('testcases')}>Add Test Case</button>

                            <button type="button" onClick={()=>{
                                editProblemSubmit();
                                editContestProblem();
                                }}>Save Changes</button>
                            <button type="button" onClick={() => setIsEditProblem(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteProblem && (
                <div className="contest-details-modal">
                    <div className="contest-details-modal-content">
                        <h2>Are you sure you want to delete this problem?</h2>
                        <button type="button" onClick={()=>{
                            deleteProblemSubmit();
                            editContestProblem();
                            }}>Yes</button>
                        <button type="button" onClick={() => setIsDeleteProblem(false)}>No</button>
                    </div>
                </div>
            )}

            {isAddProblem && (
                <div className="contest-details-modal">
                    <div className="contest-details-modal-content">
                        <h2>Add New Problem</h2>
                        <form className='contest-details-add-form' onSubmit={addProblemSubmit}>
                            <label>Title: </label>
                            <input type="text" name="title" value={newProblem.title} onChange={handleAddProblemChange} />
                            <label>Description: </label>
                            <textarea name="description" value={newProblem.description} onChange={handleAddProblemChange} />
                            <label>Difficulty: </label>
                            <select name="difficulty" value={newProblem.difficulty} onChange={handleAddProblemChange}>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                            <label>Constraints: </label>
                            <textarea name="constraints" value={newProblem.constraints} onChange={handleAddProblemChange} />
                            <label>Time Constraints: </label>
                            <input type="text" name="timeConstraints" value={newProblem.timeConstraints} onChange={handleAddProblemChange} />
                            <label>Space Constraints: </label>
                            <input type="text" name="spaceConstraints" value={newProblem.spaceConstraints} onChange={handleAddProblemChange} />
                            <label>Input Format: </label>
                            <textarea name="inputFormat" value={newProblem.inputFormat} onChange={handleAddProblemChange} />
                            <label>Output Format: </label>
                            <textarea name="outputFormat" value={newProblem.outputFormat} onChange={handleAddProblemChange} />

                            <h3>Examples</h3>
                            {newProblem.examples.map((example, index) => (
                                <div key={index} className="example-form-group">
                                    <label>Example {index + 1} Input: </label>
                                    <textarea
                                        name="input"
                                        value={example.input}
                                        onChange={(e) => handleAddExampleChange(e, index)}
                                    />
                                    <label>Example {index + 1} Output: </label>
                                    <textarea
                                        name="output"
                                        value={example.output}
                                        onChange={(e) => handleAddExampleChange(e, index)}
                                    />
                                    <button type="button" onClick={() => removeExample(index)}>Remove Example</button>
                                </div>
                            ))}
                            <button type="button" onClick={addExample}>Add Example</button>

                            <h3>Test Cases</h3>
                            {newProblem.testcases.map((testcase, index) => (
                                <div key={index} className="testcase-form-group">
                                    <label>Test Case {index + 1} Input: </label>
                                    <textarea
                                        name="input"
                                        value={testcase.input}
                                        onChange={(e) => handleTestcaseChange(e, index)}
                                    />
                                    <label>Test Case {index + 1} Output: </label>
                                    <textarea
                                        name="output"
                                        value={testcase.output}
                                        onChange={(e) => handleTestcaseChange(e, index)}
                                    />
                                    <button type="button" onClick={() => removeTestcase(index)}>Remove Test Case</button>
                                </div>
                            ))}
                            <button type="button" onClick={addTestcase}>Add Test Case</button>

                            <button type="submit">Add Problem</button>
                            <button type="button" onClick={() => setIsAddProblem(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
            </>):(
                <div>Loading...</div>
            )}
        </div>
    );
};

export default ContestDetails;                            