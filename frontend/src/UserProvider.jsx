import React,{ useState, useEffect, useContext } from 'react';
import api from '../api';
export const Context=React.createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
      try {
        
        const response = await api.get('/profile');
        console.log('User response:', response.data);
        if (response.data.UserType === 'Admin') {
          setUser(response.data.user);
        } else {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
        setUser(null);
      }
    
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <Context.Provider value={{ user, fetchUser }}>
      {children}
    </Context.Provider>
  );
}

export default UserProvider;