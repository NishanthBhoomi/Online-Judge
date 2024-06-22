import {useState} from 'react';
import { loginData } from '../services/Login';

const Login = () =>{
    const [email, setEmail]= useState('');
    const [ password, setPassword]= useState('');
    
    const loginSubmit = async (e) =>{
        e.preventDefault();
        try {
            const logInfo={email,password};
            const data=await loginData(logInfo);
            console.log("Logged in data ",data);
        } catch (error) {
            console.log("API call for Login data failed",error);
        }
    };

    return(
        <form onSubmit={loginSubmit}>
            <h2>Login</h2>
            <label>Email: </label>
            <input type="email" value={email} placeholder='Enter Your Email' onChange={(e) =>setEmail(e.target.value)} required/> <br /> <br /> 
            <label>Password: </label>
            <input type="password" value={password} placeholder='Enter Your Password' onChange={(e) => setPassword(e.target.value)} required/> <br /><br />        
            <button type="submit">Login</button>
        </form>
    );
};

export default Login;