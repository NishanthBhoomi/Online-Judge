import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Context } from '../UserProvider';
import api from '../../api';
import { IconButton, InputAdornment, TextField, Typography, FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import './css/Login.css';

const Login = () => {
    const { fetchUser } = useContext(Context);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [type, setType] = useState('User');
    const [key, setKey] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const navigate = useNavigate();

    const loginSubmit = async (e) => {
        e.preventDefault();
        if (type === "Admin" && key !== "ADMIN_KEY") {
            console.log("Invalid Secret Key");
            return;
        }
        try {
            const logInfo = { email, password, type, key };
            const response = await api.post('/login', logInfo);
            const data = response.data;
            if (data && data.success && type === "User") {
                console.log("User's Logged in data ", data);
                await fetchUser();
                navigate('/problems');
            } else if (data && data.success && type === "Admin") {
                console.log("Admin's Logged in data ", data);
                await fetchUser();
                navigate('/admin');
            } else {
                console.log(data ? data.message : 'Login failed!, Please try again.');
            }
        } catch (error) {
            console.log("API call for login data failed ");
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <form onSubmit={loginSubmit} className='login-form'>
                    <h1 className='login-heading'>
                        Login
                    </h1>
                    <div className="login-type-section">
                        <FormControl component="fieldset" className='user-type'>
                            <RadioGroup
                                row
                                aria-label="userType"
                                name="userType"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <FormControlLabel value="User" control={<Radio />} label="User" />
                                <FormControlLabel value="Admin" control={<Radio />} label="Admin" />
                            </RadioGroup>
                        </FormControl>
                    </div>
                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        placeholder='Enter Your Email'
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                    />
                    <TextField
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        placeholder='Enter Your Password'
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        edge="end"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    {type === "Admin" && (
                        <TextField
                            label="Secret Key"
                            type={showKey ? "text" : "password"}
                            value={key}
                            placeholder='Enter Secret Key'
                            onChange={(e) => setKey(e.target.value)}
                            fullWidth
                            variant="outlined"
                            margin="normal"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            edge="end"
                                            onClick={() => setShowKey(!showKey)}
                                        >
                                            {showKey ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}
                    <button type="submit" className='login-button'>Login</button>
                    <p className="signup">
                        Don&apos;t have an account? <Link to="/register">Sign up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
