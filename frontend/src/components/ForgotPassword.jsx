import { useState } from 'react';
import { Link} from 'react-router-dom';
import { TextField, Typography } from '@mui/material';
import api from '../../api';
import './css/ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/forgotPassword', { email });
            if (response.data && response.data.success) {
                setSuccess(true);
                setError(null);
            } else {
                setError(response.data.message || 'Failed to send password reset email.');
                setSuccess(false);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            setSuccess(false);
        }
    };

    return (
        <div className="forgot-password-page">
            <div className="forgot-password-container">
                <form onSubmit={handleForgotPassword} className="forgot-password-form">
                    <h1 className="forgot-password-heading">
                        Forgot Password
                    </h1>
                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                    /> 
                    <button
                        type="submit"
                        variant="contained"
                        color="primary"
                        className="forgot-password-button"
                    >
                        Submit
                    </button>
                    {error && (
                        <Typography variant="body2" color="error" className="error-message">
                            {error}
                        </Typography>
                    )}
                    {success && (
                        <Typography variant="body2" color="primary" className="success-message">
                            Password reset email sent successfully.
                        </Typography>
                    )}
                    <Typography variant="body2" className="login-link">
                        <Link to="/login">Back to Login</Link>
                    </Typography>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;