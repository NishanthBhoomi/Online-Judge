import { useState, useContext} from 'react';
import { useNavigate,Link } from 'react-router-dom';
import { Context } from '../UserProvider';
import api from '../../api'
import './css/Login.css';

const Login = () => {
    const {fetchUser}=useContext(Context);
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
            const response = await api.post('/login', logInfo);
            const data=response.data;   
            if (data && data.success && type=="User") {
                console.log("User's Logged in data ", data);
                await fetchUser();
                navigate('/problems');
            } else if(data && data.success && type=="Admin"){
                console.log("Admin's Logged in data ", data);
                await fetchUser();  
                navigate('/admin');
            }else {
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
                    <h1 className='login-heading'>Login</h1>
                    <br />
                    <div className='radio'>
                        <strong>Sign In as: </strong>
                        <label>
                        <input type="radio" name="UserType" value="User" onChange={(e) => setType(e.target.value)} />
                        User
                        </label>
                        <label>
                        <input type="radio" name='UserType' value='Admin' onChange={(e) => setType(e.target.value)} />
                        Admin
                        </label>
                    </div>
                    
                    <label>Email: </label>
                    <input type="email" value={email} placeholder='Enter Your Email' onChange={(e) => setEmail(e.target.value)} required /> 
                    <label>Password: </label>
                    <input type="password" value={password} placeholder='Enter Your Password' onChange={(e) => setPassword(e.target.value)} required /> 
                    {type == "Admin" ? (
                        <div>
                            <label>Secret Key: </label>
                            <input type="password" value={key} placeholder='Enter Secret Key' onChange={(e) => setKey(e.target.value)} required />
                        </div>) : null}
                    
                    <button type="submit" className='login-button'>Login</button>
                    <p className="signup">
                        Don't have an account? <Link to="/register">Sign up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;