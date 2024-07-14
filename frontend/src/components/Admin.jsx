import { useState, useEffect, useContext } from 'react';
import './css/Admin.css';
import { Context } from '../UserProvider';
import api from '../../api';

const Admin = () => {
    const temp = useContext(Context);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(null);
    const [isUpdate, setIsUpdate] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const [data, setData] = useState({ firstname: '', lastname: '', email: '', UserType: '' });

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

    const handleUpdateClick = (user) => {
        setSelected(user);
        setData(user);
        setIsUpdate(true);
    };

    const handleDeleteClick = (user) => {
        setSelected(user);
        setIsDelete(true);
    };

    const handleUpdateChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleUpdateSubmit = async () => {
        try {
            await api.put(`/update/${selected._id}`, data);
            setUsers(users.map(user => (user._id === selected._id ? data : user)));
            setIsUpdate(false);
        } catch (error) {
            setError('Error updating user');
        }
    };

    const handleDeleteSubmit = async () => {
        try {
            await api.delete(`/delete/${selected._id}`);
            setUsers(users.filter(user => user._id !== selected._id));
            setIsDelete(false);
        } catch (error) {
            setError('Error deleting user');
        }
    };

    if (error) {
        return <div className="admin-error-message">{error}</div>;
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
            </div>
            <table className="admin-user-table">
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>User Type</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user.firstname}</td>
                            <td>{user.lastname}</td>
                            <td>{user.email}</td>
                            <td>{user.UserType}</td>
                            <td className='admin-action-buttons'>
                                <button className="admin-update-button" onClick={() => handleUpdateClick(user)}>Update</button>
                                {temp && temp.user && temp.user.email !== user.email && (
                                    <button className="admin-delete-button" onClick={() => handleDeleteClick(user)}>Delete</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {isUpdate && (
                <div className="admin-update-modal">
                    <div className="admin-modal-content">
                        <h2>Update User</h2>
                        <form className="admin-update-form">
                            <label>First Name: </label>
                            <input type="text" name="firstname" value={data.firstname} onChange={handleUpdateChange} placeholder='First Name' /> <br />
                            <label>Last Name: </label>
                            <input type="text" name="lastname" value={data.lastname} onChange={handleUpdateChange} placeholder='Last Name' /> <br />
                            <label>Email: </label>
                            <input type="email" name="email" value={data.email} onChange={handleUpdateChange} placeholder='Email' disabled /> <br />
                            <label>User Type: </label>
                            <select name="UserType" value={data.UserType} onChange={handleUpdateChange} disabled={(temp && temp.user) ? temp.user.email === data.email : false}>
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                            </select><br />
                            <div className='admin-update-button-group'>
                                <button type="button" className="admin-submit-button" onClick={handleUpdateSubmit}>Submit</button>
                                <button type="button" className="admin-close-button" onClick={() => setIsUpdate(false)}>Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDelete && (
                <div className="admin-delete-modal">
                    <div className="admin-modal-content">
                        <h2>Are you sure you want to delete this User?</h2>
                        <div className="admin-delete-button-group">
                            <button type='button' className="admin-confirm-button" onClick={handleDeleteSubmit}>Yes</button>
                            <button type="button" className="admin-cancel-button" onClick={() => setIsDelete(false)}>No</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;
