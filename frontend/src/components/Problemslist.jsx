import { getProblems } from "../services/Problemlist";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

const Problemslist = () => {
    const [problems, setProblems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProblems = async () => {
          try {
            const response = await getProblems();
            if (response) {
              setProblems(response);
            } else {
              console.log("Error fetching problems: ", response.message);
            }
          } catch (error) {
            console.log("Error fetching problems", error);
          }
        };
        fetchProblems();
      }, []);
    
    const handleProblemClick = (id) => {
        navigate(`/problem/${id}`);
    };

    return (
        <div>
            <h1>Problem List</h1>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>#</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Title</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Difficulty</th>
                    </tr>
                </thead>
                <tbody>
                    {problems.map((problem, index) => (
                        <tr key={problem._id} onClick={() => handleProblemClick(problem._id)} style={{ cursor: "pointer" }}>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign:"center" }}>{index + 1}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign:"center" }}>{problem.title}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign:"center" }}>{problem.difficulty}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Problemslist;
