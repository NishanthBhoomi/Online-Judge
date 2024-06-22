import {Link} from 'react-router-dom';

const Home= () =>{
    return(
        <div>
            <h1> Online Judge</h1>
            <p> This is the home page of the Online Judge Platform.</p>
            <div>
                <Link to="/login">Login</Link> <br />
                <Link to="/register">Register</Link>
            </div>
        </div>
    );
};

export default Home; 