import { Link } from 'react-router-dom';
import './css/Home.css';

const Home = () => {
    return (
        <div className="home-page">
            <div className="home-container">
                <div className="home-content">
                    <h1 className="home-title">Welcome to Coding Judge!</h1>
                    <p className="home-description">
                        Coding Judge is an Online Judge which is the perfect platform to learn problem solving and practice competitive programming.
                    </p>
                    <div className="home-buttons">
                        <Link to="/login" className="home-button">Login</Link>
                        <Link to="/register" className="home-button">Register</Link>
                    </div>
                    <div className="home-media">
                        <img src="https://cdn.dribbble.com/users/1162077/screenshots/3848914/programmer.gif" alt="Programming GIF" className="home-media-item" />
                        <img src="https://media.giphy.com/media/LMcB8XospGZO8UQq87/giphy.gif" alt="Competitive Programming GIF" className="home-media-item" />                    
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
