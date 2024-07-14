import { useState, useEffect } from 'react';
import api from '../../api';
import { useParams } from 'react-router-dom';
import Results from './Results';
import './css/ResultsPage.css';

const ResultsPage = () => {
    const { id } = useParams();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [contest, setContest] = useState(null);

    const fetchResults = async () => {
        try {
            const { data } = await api.get(`/contests/${id}`);
            setContest(data);

            const now = new Date();
            const endTimeDate = new Date(data.endTime);
            const offset = 5.5 * 60 * 60 * 1000; 
            const localEndTime = new Date(endTimeDate.getTime() - offset); 
        
            if (now < localEndTime) {
                const response = await api.get(`/contests/${id}/results`);
                setResults(response.data);
            } else {
                setResults(data.results);
            }
        } catch (error) {
            setError('Error fetching results.');
            console.error('Error fetching results:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, [id]);

    const handleRefresh = async () => {
        setLoading(true);
        await fetchResults();
    };

    if (loading) return <p>Loading results...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className='results-page-container'> 
            <button className="refresh-results-button" onClick={handleRefresh} disabled={loading}>
                Refresh Results
            </button>
            <Results results={results} contest={contest} />
        </div>
    );
};

export default ResultsPage;
