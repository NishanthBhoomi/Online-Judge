import { Link } from 'react-router-dom';
import './css/Home.css';

const Home = () => {
    return (
        <div className="home-page">
            <div className="home-intro">
                <div className="home-intro-content">
                    <h1 className="home-title">Welcome to Coding Judge!</h1>
                    <p className="home-description">
                        Coding Judge is the perfect platform to learn problem-solving and practice competitive programming.
                    </p>
                    <div className="home-buttons">
                        <Link to="/login" className="home-button login-button">Login</Link>
                        <Link to="/register" className="home-button sign-up-button">Sign Up</Link>
                    </div>
                </div>
            </div>
            <section className="features">
                <h2>Features</h2>
                <div className="feature-items">
                    <div className="feature-item">
                        <img src="../../assets/Problems.jpg" alt="Programming Problems" className="feature-icon" />
                        <div className="feature-description">
                            <h3>Wide Range of Programming Problems</h3>
                            <p>Explore a vast collection of problems for all skill levels.</p>
                        </div>
                    </div>
                    <div className="feature-item">
                        <img src="../../assets/code.jpg" alt="Real-Time Coding Environment" className="feature-icon" />
                        <div className="feature-description">
                            <h3>Real-Time Coding Environment</h3>
                            <p>Write and test your code with instant results.</p>
                        </div>
                    </div>
                    <div className="feature-item">
                        <img src="../../assets/Contests.jpg" alt="Competitive Contests" className="feature-icon" />
                        <div className="feature-description">
                            <h3>Competitive Programming Contests</h3>
                            <p>Join contests and compete with programmers and improve your problem solving skills.</p>
                        </div>
                    </div>
                    <div className="feature-item centered-feature">
                        <img src="../../assets/Rankings.png" alt="Leaderboards and Rankings" className="feature-icon" />
                        <div className="feature-description">
                            <h3>Leaderboards and Rankings</h3>
                            <p>Track your progress and compete for top spots.</p>
                        </div>
                    </div>
                </div>
            </section>
            <section className="how-it-works">
                <h2>How It Works</h2>
                <p>
                    Sign up, solve problems, participate in contests, and track your progress and keep on improving your programming skills.
                </p>
                <img src="../../assets/sign_up.jpeg" alt="How It Works" className="sign-up-image" />
            </section>
        </div>
    );
};

export default Home;
