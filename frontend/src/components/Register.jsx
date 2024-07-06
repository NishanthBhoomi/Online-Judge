import { useState,useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { Context } from '../UserProvider.jsx';
import './css/Register.css';

const Register = () => {
    const {fetchUser}=useContext(Context);
    const [firstname, setFirst] = useState('');
    const [lastname, setLast] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [type, setType] = useState('User');
    const [key, setKey] = useState('');

    const navigate = useNavigate();

    const RegSubmit = async (e) => {
        if(type == "Admin" && key != "ADMIN_KEY"){
            console.log("Invalid Secret Key");
            e.preventDefault();
            return;
        }
        e.preventDefault();
        try {
            const regInfo = { firstname, lastname, email, password ,type ,key};
            const response = await api.post('/register',regInfo);
            const data = response.data;
            if (data && data.success && type=="User") {
                console.log("Registered successfully ", data);
                await fetchUser();
                navigate('/problems');
            } else if(data && data.success && type=="Admin"){
                console.log("Registered successfully ", data);
                await fetchUser();
                navigate('/admin');
            }else {
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
                    <h2 className="register-heading">Register</h2>
                    <div className="radio-group">
                        <strong>Sign Up as: </strong>
                        <label>
                            <input type="radio" name="UserType" value="User" onChange={(e) => setType(e.target.value)} />
                            User
                        </label>
                        <label>
                            <input type="radio" name="UserType" value="Admin" onChange={(e) => setType(e.target.value)} />
                            Admin
                        </label>
                    </div>
                    <label>Firstname: </label>
                    <input type="text" value={firstname} placeholder="Enter Your Firstname" onChange={(e) => setFirst(e.target.value)} required/>
                    <label>Lastname: </label>
                    <input type="text"value={lastname} placeholder="Enter Your Lastname"onChange={(e) => setLast(e.target.value)} required />
                    <label>Email: </label>
                    <input type="email"value={email} placeholder="Enter Your Email"onChange={(e) => setEmail(e.target.value)} required />
                    <label>Password: </label>
                    <input type="password"value={password} placeholder="Enter Your Password"onChange={(e) => setPassword(e.target.value)} required />
                    {type === 'Admin' && (
                        <>
                            <label>Secret Key: </label>
                            <input type="password"value={key} placeholder="Enter Secret Key"onChange={(e) => setKey(e.target.value)} required />
                        </>
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