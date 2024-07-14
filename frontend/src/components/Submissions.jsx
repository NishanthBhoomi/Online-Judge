import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Modal from './CodeModal';
import api from '../../api';
import { format } from 'date-fns';
import './css/Submissions.css';

import cppImage from '/assets/c++.jpg';
import javaImage from '/assets/java.jpg';
import pythonImage from '/assets/python.jpg';
import cImage from '/assets/C.jpeg';

const languageSymbols = {
    cpp: cppImage,
    py: pythonImage,
    java: javaImage,
    c: cImage
};
const verdictColors = {
    'Accepted': '#00ff00',
    'Wrong Answer': 'red',
    'Runtime Error': 'red',
    'Time Limit Exceeded': 'red',
    'Memory Limit Exceeded': 'red'
};

const Submissions = ({ apiEndpoint, title }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('');

    const { problemId, contestId, userId } = useParams();

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const endpoint = apiEndpoint
                    .replace(':problemId', problemId || '')
                    .replace(':contestId', contestId || '')
                    .replace(':userId', userId || '');

                const response = await api.get(endpoint);
                setSubmissions(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching submissions:', error);
                setError(error);
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, [apiEndpoint, problemId, contestId, userId]);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">Error: {error.message}</div>;
    }

    const openModal = (code, language) => {
        setLanguage(language);
        setCode(code);
        setOpen(true);
    };

    const closeModal = () => {
        setOpen(false);
        setLanguage('');
        setCode('');
    };

    return (
        <div className="submissions-container">
            <h1>{title}</h1>
            <table className="submissions-table">
                <thead>
                    <tr>
                        <th>Problem</th>
                        <th>Language</th>
                        <th>User</th>
                        <th>Email</th>
                        <th>Verdict</th>
                        <th>Submitted At</th>
                        <th>Code</th>
                    </tr>
                </thead>
                <tbody>
                    {submissions.map((submission) => (
                        <tr key={submission._id} className={submission.result === 'Accepted' ? 'accepted' : 'not-accepted'}>
                            <td>{submission.problem?.title || 'No Problem Title'}</td>
                            <td>
                                {languageSymbols[submission.language] 
                                    ? <img src={languageSymbols[submission.language]} alt={submission.language} className="language-icon" />
                                    : submission.language}
                            </td>                            <td>{submission.user.firstname}</td>
                            <td>{submission.user.email}</td>
                            <td style={{ color: verdictColors[submission.result] || 'black' }}><strong>{submission.result}</strong></td>
                            <td>{format(new Date(submission.timestamp), 'PPpp')}</td>
                            <td>
                                <button className="code-button" onClick={() => openModal(submission.code, submission.language)}>
                                    &lt;/&gt;
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Modal isOpen={open} onClose={closeModal} code={code} language={language} />
        </div>
    );
};

export default Submissions;
