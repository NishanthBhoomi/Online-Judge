import { useEffect, useState } from 'react';
import api from '../../api.js';
import './css/Results.css';

const Results = ({ results, contest }) => {
    const [problemTitles, setProblemTitles] = useState({});

    useEffect(() => {
        const fetchProblemTitles = async () => {
            try {
                const titles = await Promise.all(
                    contest.problems.map(async (problem) => {
                        const response = await api.get(`/problem/${problem.problem}`);
                        return { id: problem.problem, title: response.data.title };
                    })
                );
                setProblemTitles(titles.reduce((acc, { id, title }) => {
                    acc[id] = title;
                    return acc;
                }, {}));
            } catch (error) {
                console.error('Failed to fetch problem titles', error);
            }
        };

        fetchProblemTitles();
    }, [contest.problems]);

    return (
        <div className="results-container">
            <header className="results-header">
                <h1>Contest Results</h1>
            </header>
            <table className="results-table">
                <thead>
                    <tr>
                        <th><strong>Rank</strong></th>
                        <th><strong>User</strong></th>
                        <th><strong>Email</strong></th>
                        <th><strong>Total Score</strong></th>
                        {contest.problems.map((problem) => (
                            <th key={problem.problem}>{problemTitles[problem.problem] || 'Loading...'}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {results.map((result, index) => (
                        <tr key={result.user}>
                            <td>{index + 1}</td>
                            <td>{result.firstname}</td>
                            <td>{result.email}</td>
                            <td>{result.score}</td>
                            {contest.problems.map((problem) => {
                                const problemResult = result.problems.find(p => p.problem === problem.problem);
                                return (
                                    <td key={problem.problem}>
                                        {problemResult ? problemResult.score : 0}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Results;
