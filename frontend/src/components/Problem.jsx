import { useEffect, useState } from 'react';
import { useParams ,Link} from 'react-router-dom';
import api from '../../api';

import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';

const Problem = () => {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [output, setOutput] = useState('');
    const [code, setCode] = useState(`
#include <bits/stdc++.h> 

using namespace std;

int main() { 
    cout << "Hello World!"; 
    
    return 0; 
}`);
    const [Language, setLanguage] = useState('cpp');
    const [input, setInput] = useState('');

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const response = await api.get(`/problem/${id}`);
                setProblem(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error fetching problem');
                setLoading(false);
            }
        };
        fetchProblem();
    }, [id]);

    const handleCodeChange = (newCode) => {
        setCode(newCode);
    };

    const handleRunCode = async () => {
        const payload = {
            problemId: id,
            language: Language,
            code,
            input
        };

        try {
            const response = await api.post('/run',payload);
            const data = response.data;
            console.log("Data is ", data);
            if(data.output){
                 setOutput(data.output);
                 console.log("Output is ", data.output);
            }
        } catch (error) {
            if(error.response.data && error.response.data.type){
                if(error.response.data.type === 'compilation'){
                    setOutput(error.response.data.error_message);
                }else if(error.response.data.type === 'runtime'){
                    setOutput("Runtime Error");
                }else if(error.response.data.type==='time'){
                    setOutput("Time Limit Exceeded");
                }else if(error.response.data.type==='memory'){
                    setOutput("Memory Limit Exceeded");
                }
            }
            else{
                const errorMessage = error.response && error.response.data && error.response.data.message? error.response.data.message: "An unknown error occurred";
                setOutput(errorMessage);
                console.log("Not working ", error);
            }
        }
    };

    const handleSubmitCode = async () => {
        const payload = {
            problemId: id,
            language: Language,
            code,
        };

        try {
            const response = await api.post('/submit', payload);
            const data = response.data;
            if(data.type){
                setOutput(data.type);
                console.log("Final status is ", data.type);  
                if (data.type == "Wrong Answer") {
                    console.log(`Output is:\n${data.output}`);
                    const errorMessage = `Wrong Answer\ninput:\n${data.input}\n\nexpected output:\n${data.answer}\n\nYour code's output:\n${data.output}`;
                    setOutput(errorMessage);
                }
            }
        } catch (error) {
            console.log("Error is ", error);
            if(error.response.data && error.response.data.type){
                if(error.response.data.type === 'compilation'){
                    setOutput(error.response.data.error_message);
                }else if(error.response.data.type === 'runtime'){
                    setOutput("Runtime Error");
                }else if(error.response.data.type==='time'){
                    setOutput("Time Limit Exceeded");
                }else if(error.response.data.type==='memory'){
                    setOutput("Memory Limit Exceeded");
                }
            }
            else{
                const errorMessage = error.response && error.response.data && error.response.data.message? error.response.data.message: "An unknown error occurred";
                setOutput(errorMessage);
                console.log("Submission Error ", error);
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div style={{ position: 'relative', height: '100vh', padding: '20px' }}>
            <Link to="/submissions" style={{ position: 'absolute', top: '20px', right: '20px' }}>
                <button style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    View Submissions
                </button>
            </Link>
            <div style={{ display: 'flex', height: 'calc(100% - 50px)', padding: '20px' }}>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <h1>{problem.title}</h1>
                    <h2>Description: </h2> <p>{problem.description}</p>
                    <p><strong>Difficulty:</strong> {problem.difficulty}</p>
                    <p><strong>Constraints:</strong> {problem.constraints}</p>
                    <p><strong>Time Constraints:</strong> {problem.timeConstraints}</p>
                    <p><strong>Space Constraints:</strong> {problem.spaceConstraints}</p>
                    <p><strong>Input Format:</strong> {problem.inputFormat}</p>
                    <p><strong>Output Format:</strong> {problem.outputFormat}</p>
                    <h2>Examples :</h2>
                    <ul>
                        {problem.examples.map((example, index) => (
                            <li key={index}>
                                <strong>Input:</strong> {example.input}<br />
                                <strong>Output:</strong> {example.output}
                            </li>
                        ))}
                    </ul>
                </div>
                <div style={{ width: '600px', height: '100%', display: 'flex', flexDirection: 'column', marginLeft: '20px' }}>
                    <h2>Code Editor</h2>
                    <select
                        value={Language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="select-box border border-gray-300 rounded-lg py-1.5 px-4 mb-1 focus:outline-none focus:border-indigo-500"
                    >
                        <option value='cpp'>C++</option>
                        <option value='c'>C</option>
                        <option value='py'>Python</option>
                        <option value='java'>Java</option>
                    </select>
                    <br />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ flex: 1, overflow: 'auto' }}>
                            <Editor
                                value={code}
                                onValueChange={handleCodeChange}
                                highlight={code => highlight(code, languages.js)}
                                padding={10}
                                style={{
                                    fontFamily: '"Fira code", "Fira Mono", monospace',
                                    fontSize: 12,
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    minHeight: '460px',
                                    overflow: 'auto',
                                    whiteSpace: 'pre-wrap',
                                    wordWrap: 'break-word'
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', height: '100px', marginTop: '10px' }}>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter input here..."
                            style={{
                                flex: 1,
                                fontFamily: '"Fira code", "Fira Mono", monospace',
                                fontSize: 12,
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                marginRight: '10px',
                                overflowY: 'auto',
                                height: '115px'
                            }}
                        />
                        <div
                            className="outputbox"
                            style={{
                                flex: 1,
                                fontFamily: '"Fira code", "Fira Mono", monospace',
                                fontSize: 12,
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                padding: '10px',
                                backgroundColor: '#f9f9f9',
                                whiteSpace: 'pre-wrap',
                                overflowY: 'auto',
                                height: '100px'
                            }}>
                            {output}
                        </div>
                    </div>
                    <div style={{ display: 'flex', marginTop: '30px', gap: '10px' }}>
                        <button onClick={handleRunCode} style={{ flex: 1 }}>Run</button>
                        <button onClick={handleSubmitCode} style={{ flex: 1 }}>Submit</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Problem;    