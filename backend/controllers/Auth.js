import jwt from 'jsonwebtoken';

const Auth=async(req,res,next)=>{
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Unauthorized access: No token provided');
        return res.status(401).json({ message: "Unauthorized Access, No token", success: false });
    }
    
    const token = authHeader.split(' ')[1];
    
    try{
        const decoded=jwt.verify(token,process.env.SECRET_KEY);
        req.user=decoded;
        next();
    }
    catch(err){
        console.log('Unauthorized access: Invalid token');
        return res.status(401).json({message:"Unauthorized Access, Invalid token",success:false});
    }
};

export default Auth;