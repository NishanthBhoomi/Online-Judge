import { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import './css/Profile.css';

const Profile = () => {
    const [user, setUser] = useState({firstname:'', lastname:'', email:'', UserType:''});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate=useNavigate();

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
    }, []);

    const handleChange=(e)=>{
        setUser({...user,[e.target.name]:e.target.value});
    };
    
    const handleSubmit=async(e)=>{
        e.preventDefault();
        try {
            const data = await api.put('/update',user);
            const response =data.data;
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

    const handleBack = () => {
        navigate('/problems');
    };

    return (
        <div className='profile-container'>
            <button onClick={handleBack} className="back-button">Back to Problems</button>
            <h1>Profile</h1>
            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                    <label>First Name:</label>
                    <input type="text" name="firstname" value={user.firstname} onChange={handleChange} className="form-input"/>
                </div>
                <div className="form-group">
                    <label>Last Name:</label>
                    <input type="text" name="lastname" value={user.lastname} onChange={handleChange}  className="form-input"/>
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input type="email" name="email" value={user.email} disabled  className="form-input"/>
                </div>
                <div className="form-group">
                    <label>User Type:</label>
                    <input type="text" name="UserType" value={user.UserType} disabled  className="form-input"/>
                </div>    
                <br />
                <button type="submit" className="update-button">Update</button>
            </form>
            {success && <div className="success-message">{success}</div>}
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default Profile;