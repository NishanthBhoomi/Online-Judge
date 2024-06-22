import {useState} from 'react';
import { regData } from '../services/Register';

const Register= ()=>{
    const [firstname,setFirst]=useState('');
    const [lastname,setLast]=useState('');
    const [email, setEmail]= useState('');
    const [password, setPassword]= useState('');

    const RegSubmit=async(e)=>{
        e.preventDefault();
        try {
            const regInfo={firstname,lastname,email,password};
            const data=await regData(regInfo);
            console.log("Registered data ",data);
        } catch (error) {
            console.log("API call for Reg data failed ",error);
        }
    }

    return (
        <form onSubmit={RegSubmit}>
            <h2 >Register</h2>
            <label>Firstname :</label>
            <input type="text" value={firstname} onChange={(e) =>setFirst(e.target.value)} required/> <br/>
            <label>Lastname :</label>
            <input type="text" value={lastname} onChange={(e) => setLast(e.target.value)} required/> <br/>
            <label>Email :</label>
            <input type="email" value={email} onChange={(e) =>setEmail(e.target.value)} required/> <br />
            <label>Password :</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/> <br />
            <button type="submit">Register</button>
        </form>
    );
};

export default Register;