import User from '../models/Users.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from "dotenv";
dotenv.config();

const Register = async(req,res) =>{
    try{
        // get all the data from the request body
        const {firstname,lastname, email, password}=req.body;

        //check that all the data should exist
        if(!(firstname && lastname && email && password)){
            return res.status(400).json({message:"Please enter all the required fields"});
        }

        // check if user already exists
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }

        //encrypt the password
        const hashPassword = await bcrypt.hashSync(password, 10);
        console.log(hashPassword);
        
        //save the user to the database
        const user= await User.create({
            firstname,
            lastname,
            email,
            password:hashPassword,
        });

        //generate a token for user and send it
        const token= jwt.sign({id:user._id,email}, process.env.SECRET_KEY, {
            expiresIn:"1d"
        });
        user.token=token;
        user.password=undefined;
        res.status(200).json({
            message: "You have successfully registered.",
            user,
            token
        })
    }catch(error){
        console.log(error);
    }
};

const Login =async(req,res)=>{
    try{
        //get all the user details
        const {email,password}=req.body;

        //check that all the data exists
        if(!(email && password)){
            return res.status(400).json({message:"Please enter all the information"});
        }

        //find the user in the database
        const user=await User.findOne({email});
        if(!user){
            return res.status(401).json({message:"User not found"});
        }

        //match the password
        const pass=await bcrypt.compare(password,user.password);
        if(!pass){
            return res.status(401).json({message:"Password is incorrect"});
        }

        //create token
        const token= jwt.sign({id:user._id},process.env.SECRET_KEY,{
            expiresIn:"1d",
        });
        user.token=token;
        user.password=undefined;
        
        //store cookies
        const options= {
            expires: new Date(Date.now() + 1*24*60*60*1000),
            httpOnly:true,
        };

        //send the token
        res.status(200).cookie("token",token,options).json({
            message: "You have successfully logged in",
            success:true,
            token,
        })
    }
    catch(error){
        console.log(error.message);
    }
}

const controller={
    Register,
    Login,
};

export default controller;