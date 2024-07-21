import { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import api from '../../api';
import './css/Profile.css';

const Profile = () => {
    const [user, setUser] = useState({ firstname: '', lastname: '', email: '', UserType: '' });
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api.get('/profile');
                const response = data.data;
                if (response) {
                    setUser(response);
                } else {
                    console.log("Error fetching profile: ", response.message);
                }
            } catch (error) {
                console.log("Error fetching profile", error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();

        const fetchSubmissions = async () => {
            try {
                const data = await api.get('/submissions');
                setSubmissions(data.data);
            } catch (error) {
                console.log("Error fetching submissions", error);
                setError(error);
            }
        };
        fetchSubmissions();
    }, []);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await api.put('/update', user);
            const response = data.data;
            if (response.success) {
                setSuccess("Profile updated successfully!");
                setError(null);
                const data = await api.get('/profile');
                const updatedProfile = data.data;
                setUser(updatedProfile);
            } else {
                setError(response.message);
                setSuccess(null);
            }
        } catch (error) {
            setError("Error updating profile");
            setSuccess(null);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const getPieData = () => {
        const accepted = submissions.filter(sub => sub.result === 'Accepted').length;
        const wrong = submissions.filter(sub => sub.result === 'Wrong Answer').length;
        const other = submissions.length - accepted - wrong;
        return {
            labels: ['Accepted', 'Wrong Answer', 'Others'],
            datasets: [
                {
                    label: '# of Submissions',
                    data: [accepted, wrong, other],
                    backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
                    borderWidth: 1,
                },
            ],
        };
    };

    const getYearlySubmissions = () => {
        const years = {};
        submissions.forEach(sub => {
            const year = new Date(sub.date).getFullYear();
            if (!years[year]) {
                years[year] = 0;
            }
            years[year]++;
        });
        return years;
    };

    const yearlySubmissions = getYearlySubmissions();

    return (
        <div className='profile-container'>
            <h1>Profile</h1>
            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                    <label>First Name:</label>
                    <input type="text" name="firstname" value={user.firstname} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                    <label>Last Name:</label>
                    <input type="text" name="lastname" value={user.lastname} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input type="email" name="email" value={user.email} disabled className="form-input" />
                </div>
                <div className="form-group">
                    <label>User Type:</label>
                    <input type="text" name="UserType" value={user.UserType} disabled className="form-input" />
                </div>
                <br />
                <button type="submit" className="update-button">Update</button>
            </form>
            {success && <div className="success-message">{success}</div>}
            {error && <div className="error-message">{error}</div>}
            
            <div className="submission-stats">
                <h2>Submission Statistics</h2>
                <Pie data={getPieData()} />
                <h2>Yearly Submissions</h2>
                <ul className="yearly-submissions">
                    {Object.keys(yearlySubmissions).map(year => (
                        <li key={year}>{year}: {yearlySubmissions[year]} submissions</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Profile;
