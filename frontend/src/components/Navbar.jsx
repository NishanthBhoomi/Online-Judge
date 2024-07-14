import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { Context } from '../UserProvider';
import './css/Navbar.css';

const Navbar = () => {
    const { user, setUser } = useContext(Context);
    const navigate = useNavigate();
    const [loggedOut, setLoggedOut] = useState(false);

    const navigateTo = (path) => {
        navigate(path);
    };

    const logout = async () => {
        try {
            await api.post('/logout');
            setUser(null); 
            setLoggedOut(true); 
            navigate('/login'); 
        } catch (error) {
            console.log('Error logging out', error);
        }
    };

    useEffect(() => {
        if (user === null) {
            setLoggedOut(true);
        } else {
            setLoggedOut(false);
        }
    }, [user]);

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <img
                    src="../../favicon/favicon-32x32.png"
                    alt="Coding Judge Favicon"
                    className="favicon"
                />
                <h1 onClick={() => navigateTo('/')}>Coding Judge</h1>
                {!loggedOut && (
                    <>
                        <span className="nav-link" onClick={() => navigateTo('/problems')}>
                            Problems
                        </span>
                        <span className="nav-link" onClick={() => navigateTo('/contests')}>
                            Contests
                        </span>
                    </>
                )}
            </div>
            <div className="navbar-right">
                {loggedOut ? (
                    <>
                        <span className="nav-link" onClick={() => navigateTo('/login')}>
                            Login
                        </span>
                        <span className="nav-link" onClick={() => navigateTo('/register')}>
                            Register
                        </span>
                    </>
                ) : (
                    user && (
                        <>
                            <span className="nav-link" onClick={() => navigateTo('/profile')}>
                                Profile
                            </span>
                            <span className="nav-link" onClick={logout}>
                                Logout
                            </span>
                        </>
                    )
                )}
            </div>
        </nav>
    );
};

export default Navbar;
