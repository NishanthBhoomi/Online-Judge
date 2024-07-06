import jwt from 'jsonwebtoken';

const Auth = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        console.log('Unauthorized access: No token provided');
        return res.status(401).json({ message: "Unauthorized Access, No token", success: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        console.log('Unauthorized access: Invalid token');
        return res.status(401).json({ message: "Unauthorized Access, Invalid token", success: false });
    }
};

export default Auth;