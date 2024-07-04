import { useState, useEffect, useContext } from 'react';
import api from '../../api';
import { useNavigate } from "react-router-dom";
import './css/Problemlist.css';
import { Context } from "../App";

const Problemslist = () => {
    const  {user}  = useContext(Context);
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

    const Logout=async()=>{
      localStorage.removeItem("token");
      navigate("/login");
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
        <div className="container">
            <header className="header">
              <h1>Problem List</h1>
              <div className="buttons">
                <button className='profile-button' onClick={()=>navigate("/profile")}>Profile</button>
                <button className='logout-button' onClick={Logout}>Logout</button>
              </div>
            </header>
            <table className="table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Difficulty</th>
                        {user && user.isAdmin && (
                          <th>Action</th>
                        )}
                    </tr> 
                </thead>
                <tbody>
                    {problems.map((problem, index) => (
                        <tr key={problem._id} onClick={() => handleProblemClick(problem._id)} style={{ cursor: "pointer" }}>
                            <td>{index + 1}</td>
                            <td>{problem.title}</td>
                            <td>{problem.difficulty}</td>
                            {user && user.UserType === 'Admin' && (
                              <td> 
                                <div className="buttons">
                                  <button className='edit-button' onClick={(e) => {
                                    e.stopPropagation();
                                    EditClick(problem);
                                    }}>Edit</button>
                                  <button className='delete-button' onClick={(e) => {
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
                <div className="modal">
                    <div className="modal-content">
                        <h2>Edit Problem</h2>
                        <form className='edit-form'>
                            <label>Title: </label>
                            <input type="text" name="title" value={data.title} onChange={EditChange} placeholder='Title'/> <br />
                            
                            <label>Description: </label>
                            <textarea name="description" value={data.description} onChange={EditChange} placeholder='Description'/> <br />

                            <label>Difficulty: </label>
                            <select name="difficulty" value={data.difficulty} onChange={EditChange}>
                              <option value="easy">easy</option>
                              <option value="medium">medium</option>
                              <option value="hard">hard</option>
                            </select> <br />
                            
                            <label>Constraints: </label>
                            <textarea name="constraints" value={data.constraints} onChange={EditChange} placeholder='Constraints'/> <br />
                            <label>Time Constraints: </label>
                            <input type="text" name="timeConstraints" value={data.timeConstraints} onChange={EditChange} placeholder='Time Constraints'/> <br />
                            <label>Space Constraints: </label>
                            <input type="text" name="spaceConstraints" value={data.spaceConstraints} onChange={EditChange} placeholder='Space Constraints'/> <br />
                            
                            <label>Input Format: </label>
                            <textarea name="inputFormat" value={data.inputFormat} onChange={EditChange} placeholder='Input Format'/> <br />
                            <label>Output Format: </label>
                            <textarea name="outputFormat" value={data.outputFormat} onChange={EditChange} placeholder='Output Format'/> <br />
                            
                            <h2>Examples: </h2>
                            {data.examples.map((example, index) => (
                                <div key={index} className="example-input">
                                    <label>Example {index+1}</label><br />
                                    <input type="text" placeholder="Input" value={example.input} onChange={(e) => ArrayChange(index, 'examples', 'input', e.target.value)}/>
                                    <input type="text" placeholder="Output" value={example.output} onChange={(e) => ArrayChange(index, 'examples', 'output', e.target.value)}/>
                                    <button type="button" className="remove-button" onClick={() => ArrayRemove(index, 'examples')}>Remove</button>
                                </div>
                            ))}
                            <button type="button" className="add-button" onClick={() => ArrayAdd('examples')}>Add Example</button>
                            <br />

                            <h2>Testcases: </h2>
                            {data.testcases.map((testcase, index) => (
                                <div key={index} className="testcase-input">
                                    <label>Testcase {index+1}</label><br />
                                    <input type="text" placeholder="Input" value={testcase.input} onChange={(e) => ArrayChange(index, 'testcases', 'input', e.target.value)}/>
                                    <input type="text" placeholder="Output" value={testcase.output} onChange={(e) => ArrayChange(index, 'testcases', 'output', e.target.value)}/>
                                    <button type="button" className="remove-button" onClick={() => ArrayRemove(index, 'testcases')}>Remove</button>
                                </div>
                            ))}
                            <button type="button" className="add-button" onClick={() => ArrayAdd('testcases')}>Add Testcase</button>
                            <br />
                                                        
                            <div className='button-group'>
                                <button type="button" className='submit-button' onClick={EditSubmit}>Submit</button>
                                <button type='button' className="close-button" onClick={() => setIsEdit(false)}>Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDelete && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Delete Problem</h2>
                        <p>Are you sure you want to delete this Problem?</p>
                        <div className="button-group">
                            <button type='button' className="yes-button" onClick={DeleteSubmit}>Yes</button>
                            <button type="button" className="no-button" onClick={() => setIsDelete(false)}>No</button>
                        </div>
                    </div>
                </div>
            )}

           {user && user.isAdmin && (
            <div className="add-problem-container">
                <button className="add-problem-button" onClick={() => setIsAdd(true)}>Add Problem</button>
            </div>
            )}

            {user && user.isAdmin && isAdd && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Add New Problem</h2>
                        <form className="add-form" onSubmit={AddSubmit}>
                            <label>Title:</label>
                            <input type="text" name="title" value={newProblem.title} onChange={AddProblemChange} placeholder="Problem Title" required />

                            <label>Description:</label>
                            <textarea name="description" value={newProblem.description} onChange={AddProblemChange} placeholder="Problem Description" required></textarea>

                            <label>Difficulty:</label>
                            <select name="difficulty" value={newProblem.difficulty} onChange={AddProblemChange} required>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>

                            <label>Constraints:</label>
                            <textarea name="constraints" value={newProblem.constraints} onChange={AddProblemChange} placeholder="Constraints" required />

                            <label>Time Constraints:</label>
                            <input type="text" name="timeConstraints" value={newProblem.timeConstraints} onChange={AddProblemChange} placeholder="Time Constraints" required />

                            <label>Space Constraints:</label>
                            <input type="text" name="spaceConstraints" value={newProblem.spaceConstraints} onChange={AddProblemChange} placeholder="Space Constraints" required />

                            <label>Input Format:</label>
                            <textarea name="inputFormat" value={newProblem.inputFormat} onChange={AddProblemChange} placeholder="Input Format" required />

                            <label>Output Format:</label>
                            <input type="text" name="outputFormat" value={newProblem.outputFormat} onChange={AddProblemChange} placeholder="Output Format" required />

                            <h2>Examples:</h2>
                            {newProblem.examples.map((example, index) => (
                            <div key={index} className="example-input">
                                <label>Example {index+1}</label><br />
                                <input type="text" name="input" value={example.input} onChange={(e) => AddExampleChange(e, index)} placeholder="Example Input" />
                                <input type="text" name="output" value={example.output} onChange={(e) => AddExampleChange(e, index)} placeholder="Example Output" />
                                <button type="button" className="remove-button" onClick={() => removeExample(index)}>Remove</button>
                            </div>
                            ))}
                            <button type="button" className="add-button" onClick={addExample}>Add Example</button>

                            <h2>Testcases:</h2>
                            {newProblem.testcases.map((testcase, index) => (
                              <div key={index} className="testcase-input">
                                <label>Testcase {index+1}</label><br />
                                <input type="text" name="input" value={testcase.input} onChange={(e) => TestcaseChange(e, index)} placeholder="Testcase Input" />
                                <input type="text" name="output" value={testcase.output} onChange={(e) => TestcaseChange(e, index)} placeholder="Testcase Output" />
                                <button type="button" className="remove-button" onClick={() => removeTestcase(index)}>Remove</button>
                              </div>
                            ))}
                            <button type="button" className="add-button" onClick={addTestcase}>Add Testcase</button>

                            <div className="button-group">
                                <button type="submit" className="submit-button">Submit</button>
                                <button type="button" className="close-button" onClick={() => setIsAdd(false)}>Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );
};

export default Problemslist;