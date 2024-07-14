import { useState, useEffect, useContext } from 'react';
import api from '../../api';
import { useNavigate } from "react-router-dom";
import './css/Problemlist.css';
import { Context } from "../UserProvider";

const Problemslist = () => {
    const  {user,fetchUser}  = useContext(Context);
    const [problems, setProblems] = useState([]);
    const [selected, setSelected] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const [isAdd, setIsAdd] = useState(false);
    const [data, setData] = useState({
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
    const navigate = useNavigate();

    const fetchProblems = async () => {
      try {
        const data = await api.get('/problems');
        const response = data.data;
        if (response) {
          setProblems(response);
        } else {
          console.log("Error fetching problems: ", response.message);
        }
      } catch (error) {
        console.log("Error fetching problems", error);
      }
    };

    useEffect(() => {
      fetchProblems();
    }, []);
    
    const handleProblemClick = (id) => {
        navigate(`/problem/${id}`);
    };

    const getDifficultyColor = (difficulty) => {
      switch(difficulty) {
        case 'easy':
          return 'green';
        case 'medium':
          return 'orange';
        case 'hard':
          return 'red';
        default:
          return 'black';
      
      }
    };
  
    const EditClick = (problem) => {
      setSelected(problem);
      setData({title: problem.title, difficulty: problem.difficulty, description: problem.description, constraints: problem.constraints, timeConstraints: problem.timeConstraints, spaceConstraints: problem.spaceConstraints, inputFormat: problem.inputFormat, outputFormat: problem.outputFormat, examples: problem.examples, testcases: problem.testcases});
      setIsEdit(true);
    };

    const DeleteClick = (problem) => {
      setSelected(problem);
      setIsDelete(true);
    };

    const EditChange = (e) => {
      setData({ ...data, [e.target.name]: e.target.value });
    };

    const AddProblemChange = (e) => {
      const { name, value } = e.target;
      setNewProblem((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const AddExampleChange = (e, index) => {
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

    const ArrayChange = (index, arrayName, field, value) => {
      const newArray = [...data[arrayName]];
      newArray[index][field] = value;
      setData({ ...data, [arrayName]: newArray });
    };

    const ArrayAdd = (arrayName) => {
        setData({...data,[arrayName]: [...data[arrayName], { input: '', output: '' }]});
    };

    const ArrayRemove = (index, arrayName) => {
        const newArray = data[arrayName].filter((_, i) => i !== index);
        setData({ ...data, [arrayName]: newArray });
    };

    const TestcaseChange = (e, index) => {
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
  
    const EditSubmit = async () => {
      try {
        await api.put(`/problem/${selected._id}`, data);
        setProblems(problems.map(p => p._id === selected._id ? { ...p, ...data } : p));
        setIsEdit(false);
      } catch (error) {
        console.log("Error updating problem", error);
      }
    };

    const DeleteSubmit = async () => {
      try {
        await api.delete(`/problem/${selected._id}`);
        setProblems(problems.filter(p => p._id !== selected._id));
        setIsDelete(false);
      } catch (error) {
        console.log("Error deleting problem", error);
      }
    };

    const AddSubmit = async (e) => {
      e.preventDefault();
  
      try {
          const response=await api.post('/problem',newProblem);
          setProblems([...problems,response.data]);
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
          setIsAdd(false);
      } catch (error) {
          console.error('Error adding problem:', error);
      }
    };

    return (
        <div className="problemlist-container">
            <header className="problemlist-header">
            {user && user.isAdmin && (
              <div className="problemlist-add-problem-container">
                  <button className="problemlist-add-problem-button" onClick={() => setIsAdd(true)}>Add Problem</button>
              </div>
              )}

              <h1>Problems</h1>
              <div className="problemlist-buttons">
                <button className="problemlist-submission-button" onClick={()=>navigate("/submissions")}>My Submissions</button>
              </div>
            </header>
            <table className="problemlist-table">
                <thead>
                    <tr>
                        <th><strong>#</strong></th>
                        <th><strong>Title</strong></th>
                        <th><strong>Difficulty</strong></th>
                        {user && user.isAdmin && (
                          <th><strong>Action</strong></th>
                        )}
                    </tr> 
                </thead>
                <tbody>
                    {problems.map((problem, index) => (
                        <tr key={problem._id} onClick={() => handleProblemClick(problem._id)} style={{ cursor: "pointer" }}>
                            <td><strong>{index + 1}</strong></td>
                            <td ><strong> {problem.title}</strong></td>
                            <td style={{ color: getDifficultyColor(problem.difficulty) }}><strong>{problem.difficulty}</strong></td>
                            {user && user.UserType === 'Admin' && (
                              <td> 
                                <div className="problemlist-action-buttons">
                                  <button className='problemlist-edit-button' onClick={(e) => {
                                    e.stopPropagation();
                                    EditClick(problem);
                                    }}>Edit</button>
                                  <button className='problemlist-delete-button' onClick={(e) => {
                                    e.stopPropagation();
                                    DeleteClick(problem);
                                    }}>Delete</button>
                                </div>
                              </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            {isEdit && (
                <div className="problemlist-modal">
                    <div className="problemlist-modal-content">
                        <h1>Edit Problem</h1>
                        <form className='problemlist-edit-form'>
                            <label><h4>Title:</h4></label>
                            <input type="text" name="title" value={data.title} onChange={EditChange} placeholder='Title'/> <br />
                            
                            <label><h4>Description:</h4></label>
                            <textarea name="description" value={data.description} onChange={EditChange} placeholder='Description'/> <br />

                            <label><h4>Difficulty:</h4></label>
                            <select name="difficulty" value={data.difficulty} onChange={EditChange}>
                              <option value="easy">easy</option>
                              <option value="medium">medium</option>
                              <option value="hard">hard</option>
                            </select> <br />
                            
                            <label><h4>Constraints:</h4></label>
                            <textarea name="constraints" value={data.constraints} onChange={EditChange} placeholder='Constraints'/> <br />
                            <label><h4>Time Constraints:</h4></label>
                            <input type="text" name="timeConstraints" value={data.timeConstraints} onChange={EditChange} placeholder='Time Constraints'/> <br />
                            <label><h4>Space Constraints:</h4></label>
                            <input type="text" name="spaceConstraints" value={data.spaceConstraints} onChange={EditChange} placeholder='Space Constraints'/> <br />
                            
                            <label><h4>Input Format:</h4></label>
                            <textarea name="inputFormat" value={data.inputFormat} onChange={EditChange} placeholder='Input Format'/> <br />
                            <label><h4>Output Format:</h4></label>
                            <textarea name="outputFormat" value={data.outputFormat} onChange={EditChange} placeholder='Output Format'/> <br />
                            
                            <h2>Examples: </h2>
                            {data.examples.map((example, index) => (
                                <div key={index} className="problemlist-example-input">
                                    <label><strong>Example {index+1}</strong></label><br />
                                    <input type="text" placeholder="Input" value={example.input} onChange={(e) => ArrayChange(index, 'examples', 'input', e.target.value)}/>
                                    <input type="text" placeholder="Output" value={example.output} onChange={(e) => ArrayChange(index, 'examples', 'output', e.target.value)}/>
                                    <button type="button" className="problemlist-remove-button" onClick={() => ArrayRemove(index, 'examples')}>Remove Example</button>
                                </div>
                            ))}
                            <button type="button" className="problemlist-add-button" onClick={() => ArrayAdd('examples')}>Add Example</button>
                            <br />

                            <h2>Testcases: </h2>
                            {data.testcases.map((testcase, index) => (
                                <div key={index} className="problemlist-testcase-input">
                                    <label><strong>Testcase {index+1}</strong></label><br />
                                    <input type="text" placeholder="Input" value={testcase.input} onChange={(e) => ArrayChange(index, 'testcases', 'input', e.target.value)}/>
                                    <input type="text" placeholder="Output" value={testcase.output} onChange={(e) => ArrayChange(index, 'testcases', 'output', e.target.value)}/>
                                    <button type="button" className="problemlist-remove-button" onClick={() => ArrayRemove(index, 'testcases')}>Remove Test Case</button>
                                </div>
                            ))}
                            <button type="button" className="problemlist-add-button" onClick={() => ArrayAdd('testcases')}>Add Testcase</button>
                            <br />
                                                        
                            <div className='problemlist-button-group'>
                                <button type="button" className='problemlist-submit-button' onClick={EditSubmit}>Submit</button>
                                <button type='button' className="problemlist-close-button" onClick={() => setIsEdit(false)}>Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDelete && (
                <div className="problemlist-modal">
                    <div className="problemlist-modal-content">
                        <h1>Delete Problem</h1>
                        <p>Are you sure you want to delete this Problem?</p>
                        <div className="problemlist-button-group">
                            <button type='button' className="problemlist-yes-button" onClick={DeleteSubmit}>Yes</button>
                            <button type="button" className="problemlist-no-button" onClick={() => setIsDelete(false)}>No</button>
                        </div>
                    </div>
                </div>
            )}
           
            {user && user.isAdmin && isAdd && (
                <div className="problemlist-modal">
                    <div className="problemlist-modal-content">
                        <h1>Add New Problem</h1>
                        <form className="problemlist-add-form" onSubmit={AddSubmit}>
                            <label><h4>Title:</h4></label>
                            <input type="text" name="title" value={newProblem.title} onChange={AddProblemChange} placeholder="Problem Title" required />

                            <label><h4>Description:</h4></label>
                            <textarea name="description" value={newProblem.description} onChange={AddProblemChange} placeholder="Problem Description" required></textarea>

                            <label><h4>Difficulty:</h4></label>
                            <select name="difficulty" value={newProblem.difficulty} onChange={AddProblemChange} required>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>

                            <label><h4>Constraints:</h4></label>
                            <textarea name="constraints" value={newProblem.constraints} onChange={AddProblemChange} placeholder="Constraints" required />

                            <label><h4>Time Constraints:</h4></label>
                            <input type="text" name="timeConstraints" value={newProblem.timeConstraints} onChange={AddProblemChange} placeholder="Time Constraints" required />

                            <label><h4>Space Constraints:</h4></label>
                            <input type="text" name="spaceConstraints" value={newProblem.spaceConstraints} onChange={AddProblemChange} placeholder="Space Constraints" required />

                            <label><h4>Input Format:</h4></label>
                            <textarea name="inputFormat" value={newProblem.inputFormat} onChange={AddProblemChange} placeholder="Input Format" required />

                            <label><h4>Output Format:</h4></label>
                            <input type="text" name="outputFormat" value={newProblem.outputFormat} onChange={AddProblemChange} placeholder="Output Format" required />

                            <h2>Examples:</h2>
                            {newProblem.examples.map((example, index) => (
                            <div key={index} className="problemlist-example-input">
                                <label><strong>Example {index+1}</strong></label><br />
                                <input type="text" name="input" value={example.input} onChange={(e) => AddExampleChange(e, index)} placeholder="Example Input" />
                                <input type="text" name="output" value={example.output} onChange={(e) => AddExampleChange(e, index)} placeholder="Example Output" />
                                <button type="button" className="problemlist-remove-button" onClick={() => removeExample(index)}>Remove Example</button>
                            </div>
                            ))}
                            <button type="button" className="problemlist-add-button" onClick={addExample}>Add Example</button>

                            <h2>Testcases:</h2>
                            {newProblem.testcases.map((testcase, index) => (
                              <div key={index} className="problemlist-testcase-input">
                                <label><strong>Testcase {index+1}</strong></label><br />
                                <input type="text" name="input" value={testcase.input} onChange={(e) => TestcaseChange(e, index)} placeholder="Testcase Input" />
                                <input type="text" name="output" value={testcase.output} onChange={(e) => TestcaseChange(e, index)} placeholder="Testcase Output" />
                                <button type="button" className="problemlist-remove-button" onClick={() => removeTestcase(index)}>Remove Test Case</button>
                              </div>
                            ))}
                            <button type="button" className="problemlist-add-button" onClick={addTestcase}>Add Testcase</button>

                            <div className="problemlist-button-group">
                                <button type="submit" className="problemlist-submit-button">Submit</button>
                                <button type="button" className="problemlist-close-button" onClick={() => setIsAdd(false)}>Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );
};

export default Problemslist;