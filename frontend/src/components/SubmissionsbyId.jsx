import {useState, useEffect, useContext} from 'react';
import Modal from './CodeModal';
import { useParams } from 'react-router-dom';
import api from '../../api';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy as codeStyle } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { format } from 'date-fns';

const SubmissionsbyId = () => {
    const { problemId } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [Loading, setLoading]=useState(true);
    const [error, setError]=useState(null); 
    const [open, setOpen]=useState(false);
    const [code, setCode]=useState('');
    const [language, setLanguage]=useState('');

    useEffect(()=>{
        const fetchSubmissions = async () => {
            try {
                const response = await api.get(`/submissions/${problemId}`);
                setSubmissions(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching submissions:', error);
                setError(error);
                setLoading(false);
            }
        };
        fetchSubmissions();
    },[problemId]);

    if(Loading){
        return <div>Loading...</div>;
    }

    if(error){
        return <div>Error: {error.message}</div>;
    }

    const openModal=(code,language)=>{
        setLanguage(language);
        setCode(code);
        setOpen(true);
    };

    const closeModal=()=>{
        setOpen(false);
        setLanguage('');
        setCode('');
    };

    return(
        <div>
            <h1>Submissions</h1>
            <table>
                <thead>
                    <tr>
                        <th>Problem</th>
                        <th>Language</th>
                        <th>Verdict</th>
                        <th>Submitted At</th>
                        <th>Code</th>
                    </tr>
                </thead>
                <tbody>
                    {submissions.map((submission)=>(
                        <tr key={submission._id}>
                            <td>{submission.problem?.title || 'No Problem Title'}</td> 
                            <td>{submission.language=='cpp'?'C++':submission.language==='py'?'Python':'Java'}</td>
                            <td>{submission.result}</td>
                            <td>{format(new Date(submission.timestamp), 'PPpp')}</td>
                            <td><button onClick={()=>openModal(submission.code,submission.langugage)}>&lt;/&gt;</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Modal isOpen={open} onClose={closeModal} code={code} language={language}
                style={{
                content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    maxHeight: '80%',
                },
            }}>
                <h2>Code Viewer</h2>
                <SyntaxHighlighter language={language} style={codeStyle}>
                    {code}
                </SyntaxHighlighter>
                <button onClick={closeModal}>Close</button>
            </Modal>
        </div>
    );
};

export default SubmissionsbyId;