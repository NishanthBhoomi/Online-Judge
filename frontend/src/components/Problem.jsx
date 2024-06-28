import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProblemById } from '../services/Problem';
import { RunCode} from '../services/RunCode';

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
// Include the input/output stream library
#include <iostream> 

// Define the main function
int main() { 
    // Output "Hello World!" to the console
    std::cout << "Hello World!"; 
    
    // Return 0 to indicate successful execution
    return 0; 
}`);
    const [Language,setLanguage] = useState('cpp');
    const [input, setInput]=useState('');

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const response = await ProblemById(id);
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

    const handleRunCode = async() => {
        const payload = {
            language: Language,
            code,
            input
        };

        try {
            const data = await RunCode(payload);
            setOutput(data.output);
            console.log("Output is ",data.output);
          } catch (error) {
            console.log("Not working ",error);
          }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div style={{ display: 'flex', height: '100vh', padding: '20px' }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <h1>{problem.title}</h1>
                <h2>Description: </h2> <p>{problem.description}</p>
                <p><strong>Difficulty:</strong> {problem.difficulty}</p>
                <p><strong>Constraints:</strong> {problem.constraints}</p>
                <p><strong>Time Constraints:</strong> {problem.timeConstraints}</p>
                <p><strong>Space Constraints:</strong> {problem.spaceConstraints}</p>
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
                <select value={Language} onChange={(e)=> setLanguage(e.target.value)}
                className="select-box border border-gray-300 rounded-lg py-1.5 px-4 mb-1 focus:outline-none focus:border-indigo-500" >
                <option value='cpp'>C++</option>
                <option value='c'>C</option>
                <option value='py'>Python</option>
                <option value='java'>Java</option>
                </select>
                    <br />
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
                        minHeight: '200px',
                        flex: 1,
                        overflow: 'auto'
                    }}
                />
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter input here..."
                    style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 12,
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        minHeight: '100px',
                        marginTop: '10px'
                    }}
                />
                <button onClick={handleRunCode} style={{ marginTop: '10px' }}>Run Code</button>
                {output &&
                    <div className="outputbox mt-4 bg-gray-100 rounded-md shadow-md p-4">
                    <p style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 12,
                    }}>{output}</p>
                    </div>
                }
            </div>
        </div>
    );
};

export default Problem;