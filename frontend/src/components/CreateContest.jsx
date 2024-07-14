import { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate } from "react-router-dom";
import './css/CreateContest.css';

const CreateContest = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [problems, setProblems] = useState([]);
    const [selectedProblems, setSelectedProblems] = useState([]);
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
        score: 0
    });
    const [isAddProblem, setIsAddProblem] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        try {
            const { data } = await api.get('/problems');
            setProblems(data);
        } catch (error) {
            console.error('Error fetching problems:', error);
        }
    };

    const handleProblemChange = (e) => {
        const problemId = e.target.value;
        const isChecked = e.target.checked;

        if (isChecked) {
            setSelectedProblems((prev) => [
                ...prev,
                { problem: problemId, score: 0 } 
            ]);
        } else {
            setSelectedProblems((prev) =>
                prev.filter((problem) => problem.problem !== problemId)
            );
        }
    };

    const handleScoreChange = (e, problemId) => {
        const newScore = parseInt(e.target.value, 10);
        setSelectedProblems((prev) =>
            prev.map((problem) =>
                problem.problem === problemId ? { ...problem, score: newScore } : problem
            )
        );
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validProblems = selectedProblems.filter(p => p.score > 0);

        if (validProblems.length === 0) {
            alert('Please add at least one problem with a valid score.');
            return;
        }

        try {
            console.log("valid problems",validProblems);
            await api.post('/contest', {
                title,
                description,
                startTime,
                endTime,
                problems: validProblems
            });
            navigate('/contests');
        } catch (error) {
            console.error('Error creating contest:', error.response?.data?.message || error.message);
        }
    };

    const handleAddProblemChange = (e) => {
        const { name, value } = e.target;
        setNewProblem((prev) => ({
            ...prev,
            [name]: name==='score'? Number(value):value,
        }));
    };

    const handleExampleChange = (e, index) => {
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

    const handleAddProblemSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/problem', newProblem);
            setProblems([...problems, data]);
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
                score: 0
            });
            setIsAddProblem(false);
        } catch (error) {
            console.error('Error adding problem:', error);
        }
    };

    const handleStartTimeChange = (e) => {
        const newStartTime = e.target.value;
        if(endTime!=='' && new Date(newStartTime) > new Date(endTime)){
            alert("Start time must be less than or equal to end time.");
        }else{
            setStartTime(newStartTime);
        }
    };

    const handleEndTimeChange = (e) => {
        const newEndTime = e.target.value;
        if(startTime !== '' && new Date(startTime) > new Date(newEndTime)){
            alert("End time must be greater than or equal to start time.");
        }else{
            setEndTime(newEndTime);
        }
    };

    return (
        <div className="createcontest-container">
            <header className="createcontest-header">
                <h1>Create Contest</h1>
            </header>
            <br />
            <form onSubmit={handleSubmit} className="createcontest-form">
                <div>
                    <label htmlFor="title">Title:</label>
                    <input type="text" id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required
                    />
                </div>
                <div>
                    <label htmlFor="description">Description:</label>
                    <textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="startTime">Start Time:</label>
                    <input type="datetime-local" id="startTime" name="startTime" value={startTime} onChange={handleStartTimeChange} required/>
                </div>
                <div>
                    <label htmlFor="endTime">End Time:</label>
                    <input type="datetime-local" id="endTime" name="endTime" value={endTime} onChange={handleEndTimeChange} required/>
                </div>
                <div>
                    <label>Problems:</label>
                    <div className="problems-list">
                        {problems.map((problem) => (
                            <div key={problem._id} className="problem-item">
                                <label>
                                    <input
                                        type="checkbox"
                                        value={problem._id}
                                        data-score={problem.score}
                                        onChange={handleProblemChange}
                                    />
                                    {problem.title}
                                </label>
                                {selectedProblems.some(p => p.problem === problem._id) && (
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Score"
                                        onChange={(e) => handleScoreChange(e, problem._id)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <button type="button" className="add-problem-button" onClick={() => setIsAddProblem(true)}>Add New Problem</button>
                <button type="submit">Create Contest</button>
            </form>
            
            {isAddProblem && (
                <div className="problemlist-modal">
                    <div className="problemlist-modal-content">
                        <h2>Add New Problem</h2>
                        <form className='problemlist-add-form' onSubmit={handleAddProblemSubmit}>
                            <label><h4>Title:</h4></label>
                            <input type="text" name="title" value={newProblem.title} onChange={handleAddProblemChange} placeholder="Problem Title" required/>
                            <label><h4>Description:</h4></label>
                            <textarea name="description" value={newProblem.description} onChange={handleAddProblemChange} placeholder="Problem Description" required />
                            <label><h4>Difficulty:</h4></label>
                            <select name="difficulty" value={newProblem.difficulty} onChange={handleAddProblemChange} required >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                            <label><h4>Constraints:</h4></label>
                            <textarea name="constraints" value={newProblem.constraints} onChange={handleAddProblemChange} placeholder="Constraints" required />
                            <label><h4>Time Constraints:</h4></label>
                            <input type="text" name="timeConstraints" value={newProblem.timeConstraints} onChange={handleAddProblemChange} placeholder="Time Constraints" required/>
                            <label><h4>Space Constraints:</h4></label>
                            <input type="text" name="spaceConstraints" value={newProblem.spaceConstraints} onChange={handleAddProblemChange} placeholder="Space Constraints" required/>
                            <label><h4>Input Format:</h4></label>
                            <textarea name="inputFormat" value={newProblem.inputFormat} onChange={handleAddProblemChange} placeholder="Input Format" required />
                            <label><h4>Output Format:</h4></label>
                            <input type="text" name="outputFormat" value={newProblem.outputFormat} onChange={handleAddProblemChange} placeholder="Output Format" required/>
                            <h2>Examples:</h2>
                            {newProblem.examples.map((example, index) => (
                                <div key={index} className="problemlist-example-input">
                                    <label><strong>Example {index + 1}</strong></label><br />
                                    <input type="text" name="input" value={example.input} onChange={(e) => handleExampleChange(e, index)} placeholder="Example Input" />
                                    <input type="text" name="output" value={example.output} onChange={(e) => handleExampleChange(e, index)} placeholder="Example Output" />
                                    <button type="button" className='problemlist-remove-button' onClick={() => removeExample(index)}>Remove Example</button>
                                </div>
                            ))}
                            <button type="button" className='problemlist-add-button' onClick={addExample}>Add Example</button>
                            <h2>Test Cases:</h2>
                            {newProblem.testcases.map((testcase, index) => (
                                <div key={index} className="problemlist-testcase-input">
                                    <label><strong>Test Case {index + 1}</strong></label><br />
                                    <input type="text" name="input" value={testcase.input} onChange={(e) => handleTestcaseChange(e, index)} placeholder="Test Case Input" />
                                    <input type="text" name="output" value={testcase.output} onChange={(e) => handleTestcaseChange(e, index)} placeholder="Test Case Output" />
                                    <button type="button" className='problemlist-remove-button' onClick={() => removeTestcase(index)}>Remove Test Case</button>
                                </div>
                            ))}
                            <button type="button" className='problemlist-add-button' onClick={addTestcase}>Add Test Case</button>
                            
                            <div className="problemlist-button-group">
                                <button type="submit" className="problemlist-submit-button">Submit</button>
                                <button type="button" className="problemlist-close-button" onClick={() => setIsAddProblem(false)}>Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateContest;