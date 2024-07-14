import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../UserProvider.jsx';
import api from '../../api';
import { IconButton, InputAdornment, TextField, Typography, FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import './css/Register.css';

const Register = () => {
    const { fetchUser } = useContext(Context);
    const [firstname, setFirst] = useState('');
    const [lastname, setLast] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [type, setType] = useState('User');
    const [key, setKey] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showKey, setShowKey] = useState(false);

    const navigate = useNavigate();

    const RegSubmit = async (e) => {
        if (type === "Admin" && key !== "ADMIN_KEY") {
            console.log("Invalid Secret Key");
            e.preventDefault();
            return;
        }
        e.preventDefault();
        try {
            const regInfo = { firstname, lastname, email, password, type, key };
            const response = await api.post('/register', regInfo);
            const data = response.data;
            if (data && data.success && type === "User") {
                console.log("Registered successfully ", data);
                await fetchUser();
                navigate('/problems');
            } else if (data && data.success && type === "Admin") {
                console.log("Registered successfully ", data);
                await fetchUser();
                navigate('/admin');
            } else {
                console.log("Registration failed ");
            }
        } catch (error) {
            console.log("API call for Reg data failed ", error);
        }
    }

    return (
        <div className="register-page">
            <div className="register-container">
                <form className="register-form" onSubmit={RegSubmit}>
                    <Typography variant="h4" component="h1" className='register-heading'>
                        Register
                    </Typography>
                    <br />
                    <FormControl component="fieldset" className='radio-group'>
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
                    <TextField
                        label="Firstname"
                        type="text"
                        value={firstname}
                        placeholder="Enter Your Firstname"
                        onChange={(e) => setFirst(e.target.value)}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Lastname"
                        type="text"
                        value={lastname}
                        placeholder="Enter Your Lastname"
                        onChange={(e) => setLast(e.target.value)}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        placeholder="Enter Your Email"
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        placeholder="Enter Your Password"
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        required
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
                    {type === 'Admin' && (
                        <TextField
                            label="Secret Key"
                            type={showKey ? "text" : "password"}
                            value={key}
                            placeholder="Enter Secret Key"
                            onChange={(e) => setKey(e.target.value)}
                            fullWidth
                            variant="outlined"
                            margin="normal"
                            required
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
                    <button type="submit" className="register-button">Sign up</button>
                    <div className="signin-text">
                        Already have an account? <a onClick={() => navigate('/login')}>Login</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
