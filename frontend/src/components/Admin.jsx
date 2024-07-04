import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Admin.css';
import { Context } from '../App';
import api from '../../api';

const Admin = () => {
    const temp=useContext(Context);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(null);
    const [isUpdate, setIsUpdate] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const [data, setData] = useState({firstname:'',lastname:'',email:'',UserType:''});

    const navigate=useNavigate();
    useEffect(() => {
        const getUsers = async () => {
            try {
                const data = await api.get('/all');
                setUsers(data.data);
            } catch (error) {
                setError('Error fetching users');
            }
        };
        getUsers();
    }, []);

    const UpdateClick=(user)=>{
        setSelected(user);
        setData(user);
        setIsUpdate(true);
    };

    const DeleteClick=(user)=>{
        setSelected(user);
        setIsDelete(true);
    };

    const UpdateChange=(e)=>{
        setData({...data,[e.target.name]:e.target.value});
    };

    const UpdateSubmit=async()=>{
        try {
            await api.put(`/update/${selected._id}`,data);
            setUsers(users.map(user=>(user._id == selected._id ? data : user)));
            setIsUpdate(false);
        } catch (error) {
            setError('Error updating user');
        }
    };

    const DeleteSubmit=async()=>{
        try {
            await api.delete(`/delete/${selected._id}`);
            setUsers(users.filter(user=>(user._id != selected._id)));
            setIsDelete(false);
        } catch (error) {
            setError('Error deleting user');
        }
    }

    if(error){
        return <div>{error}</div>
    }; 

    return (
        <div>
            <div className="header-container">
                <h1>Admin Page</h1>
                <button className="problems-button" onClick={() => navigate('/problems')}>Problems</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>User Type</th>
                        <th>Action </th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user.firstname}</td>
                            <td>{user.lastname}</td>
                            <td>{user.email}</td>
                            <td>{user.UserType}</td>
                            <td className='button-group'>
                                <button onClick={()=>UpdateClick(user)}>Update</button>
                                {temp && temp.user && temp.user.email!= user.email && (
                                    <button onClick={()=>DeleteClick(user)}>Delete</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {isUpdate && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Update User</h2>
                        <form className='update-form'>
                            <label>First Name: </label>
                            <input type="text" name="firstname" value={data.firstname} onChange={UpdateChange} placeholder='Firstname'/> <br />
                            <label>Last Name: </label>
                            <input type="text" name="lastname" value={data.lastname} onChange={UpdateChange} placeholder='Lastname'/> <br />
                            <label>Email: </label>
                            <input type="email" name="email" value={data.email} onChange={UpdateChange} placeholder='Email' disabled/> <br />
                            
                            <label>User Type: </label>
                            <select name="UserType" value={data.UserType} onChange={UpdateChange} disabled={(temp && temp.user)?temp.user.email===data.email:false}>
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                            </select><br /> 
                            
                            <div className='button-group'>
                                <button onClick={UpdateSubmit}>Submit</button>
                                <button onClick={()=>setIsUpdate(false)}>Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDelete && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Are you sure you want to delete this User?</h2>
                        <div className="button-group">
                            <button type='button' onClick={DeleteSubmit}>Yes</button>
                            <button type="button" onClick={()=>setIsDelete(false)}>No</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;