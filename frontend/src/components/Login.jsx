import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginData } from '../services/Login';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [type, setType] = useState('User');
    const [key, setKey] = useState('');

    const loginSubmit = async (e) => {
        if (type == "Admin" && key != "ADMIN_KEY") {
            console.log("Invalid Secret Key");
            e.preventDefault();
            return;
        }
        e.preventDefault();
        try {
            const logInfo = { email, password, type, key };
            const data = await loginData(logInfo);
            if (data && data.success && type=="User") {
                console.log("User's Logged in data ", data);
                localStorage.setItem('token', data.token);
                navigate('/problems');
            } else if(data && data.success && type=="Admin"){
                console.log("Admin's Logged in data ", data);
                localStorage.setItem('token', data.token);
                navigate('/admin');
            }else {
                console.log(data ? data.message : 'Login failed!, Please try again.');
            }
        } catch (error) {
            console.log("API call for login data failed ");
        }
    };

    return (
        <div className="content">
            <form onSubmit={loginSubmit}>
                <h1>Login</h1>
                <div>
                    <strong>Sign In as: </strong>
                    <input type="radio" name="UserType" value="User" onChange={(e) => setType(e.target.value)} />
                    User
                    <input type="radio" name='UserType' value='Admin' onChange={(e) => setType(e.target.value)} />
                    Admin
                </div>
                <br />
                <label>Email: </label>
                <input type="email" value={email} placeholder='Enter Your Email' onChange={(e) => setEmail(e.target.value)} required /> <br /> <br />
                <label>Password: </label>
                <input type="password" value={password} placeholder='Enter Your Password' onChange={(e) => setPassword(e.target.value)} required /> <br /><br />
                {type == "Admin" ? (
                    <div>
                        <label>Secret Key: </label>
                        <input type="password" value={key} placeholder='Enter Secret Key' onChange={(e) => setKey(e.target.value)} required /> <br /><br />
                    </div>) : null}
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;