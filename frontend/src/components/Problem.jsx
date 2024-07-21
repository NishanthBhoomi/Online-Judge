import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api';

import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import './css/Problem.css'; 


const defaultCode = {
    cpp: `
#include <bits/stdc++.h> 

using namespace std;

int main() { 

    cout << "Hello World!"; 
    
    return 0; 
}`,
    java: `
public class Main {
    public static void main(String[] args) {

        System.out.println("Hello World!");
    
    }
}`,
    py: `
print("Hello World!")`,
    c: `
#include <stdio.h>

int main() {
    
    printf("Hello World!");
    
    return 0;
}`
};

const Problem = () => {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [output, setOutput] = useState('');
    const [code, setCode] = useState(defaultCode['cpp']);
    const [Language, setLanguage] = useState('cpp');
    const [input, setInput] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { contestId } = location.state || {};

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

    const LanguageChange = (e) => {
        const newLanguage = e.target.value;
        setLanguage(newLanguage);
        setCode(defaultCode[newLanguage]);
    };

    const handleRunCode = async () => {
        setOutput('');
        const payload = {
            problemId: id,
            language: Language,
            code,
            input
        };

        try {
            const response = await api.post('/run', payload);
            console.log(response);
            const data = response.data;
            if (data.output) {
                setOutput(data.output);
            }
        } catch (error) {
            if (error.response.data && error.response.data.type) {
                if (error.response.data.type === 'compilation') {
                    setOutput(error.response.data.error_message);
                } else if (error.response.data.type === 'runtime') {
                    setOutput("Runtime Error");
                } else if (error.response.data.type === 'time') {
                    setOutput("Time Limit Exceeded");
                } else if (error.response.data.type === 'memory') {
                    setOutput("Memory Limit Exceeded");
                }
            } else {
                const errorMessage = error.response && error.response.data && error.response.data.message ? error.response.data.message : "An unknown error occurred";
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
            contestId
        };

        try {
            const response = await api.post('/submit', payload);
            const data = response.data;
            if (data.type) {
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
            if (error.response.data && error.response.data.type) {
                if (error.response.data.type === 'compilation') {
                    setOutput(error.response.data.error_message);
                } else if (error.response.data.type === 'runtime') {
                    setOutput("Runtime Error");
                } else if (error.response.data.type === 'time') {
                    setOutput("Time Limit Exceeded");
                } else if (error.response.data.type === 'memory') {
                    setOutput("Memory Limit Exceeded");
                }
            } else {
                const errorMessage = error.response && error.response.data && error.response.data.message ? error.response.data.message : "An unknown error occurred";
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
        <div className="problem-container">
            <div className="problem-header">
                <button className="view-submissions-button"
                    onClick={() => navigate(`/submissions/${problem._id}`)}
                >
                    View Submissions
                </button>
            </div>
            <div className="problem-content">
                <div className="problem-details">
                    <h1 className="problem-title">{problem.title}</h1>
                    <h2>Description:</h2>
                    <p className="problem-description">{problem.description}</p>
                    <p><strong>Difficulty:</strong> {problem.difficulty}</p>
                    <p><strong>Constraints:</strong> {problem.constraints}</p>
                    <p><strong>Time Constraints:</strong> {problem.timeConstraints}</p>
                    <p><strong>Space Constraints:</strong> {problem.spaceConstraints}</p>
                    <p><strong>Input Format:</strong> {problem.inputFormat}</p>
                    <p><strong>Output Format:</strong> {problem.outputFormat}</p>
                    <h2>Examples:</h2>
                    <ul>
                        {problem.examples.map((example, index) => (
                            <li key={index}>
                                <strong>Input:</strong> {example.input}<br />
                                <strong>Output:</strong> {example.output}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="problem-editor">
                    <h2>Code Editor</h2>
                    <select
                        value={Language}
                        onChange={LanguageChange}
                        className="select-box"
                    >
                        <option value='cpp'>C++</option>
                        <option value='c'>C</option>
                        <option value='py'>Python</option>
                        <option value='java'>Java</option>
                    </select>
                    <div className="editor-container">
                        <div className="editor">
                            <Editor
                                value={code}
                                onValueChange={handleCodeChange}
                                highlight={code => highlight(code, languages.js)}
                                padding={10}
                                style={{
                                    fontFamily: '"Fira code", "Fira Mono", monospace',
                                    fontSize: 14,
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
                    <div className="input-output-container">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter input here..."
                            className="input-area"
                        />
                        <div className={`output-box ${output && output.includes('Accepted') ? 'output-success' : (output.includes('Limit Exceeded') || output.includes('Error'))? 'output-error' : ''}`}>
                            {output}
                        </div>
                    </div>
                    <div className="action-buttons">
                        <button onClick={handleRunCode} className="run-button">Run</button>
                        <button onClick={handleSubmitCode} className="submit-button">Submit</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Problem;
