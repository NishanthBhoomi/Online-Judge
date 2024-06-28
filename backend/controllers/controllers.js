import User from "../models/Users.js";
import Problem from "../models/Problems.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import axios from 'axios';
dotenv.config();

const compiler_server='http://localhost:5000';

const Register = async (req, res) => {
  try {
    // get all the data from the request body
    const { firstname, lastname, email, password, type, key } = req.body;

    //check that all the data should exist
    if (!(firstname && lastname && email && password && type)) {
      return res.status(400).json({
        message: "Please enter all the required fields",
        success: false,
      });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }

    //encrypt the password
    const hashPassword = await bcrypt.hashSync(password, 10);

    //check if the key is correct when user is admin
    let isAdmin = false;
    if (type == "Admin") {
      if (key != process.env.ADMIN_KEY) {
        return res.status(401).json({
          message: "Admin Secret Key is Incorrect",
          success: false,
        });
      }
      isAdmin = true;
    }

    //save the user to the database
    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashPassword,
      UserType: type,
      isAdmin: isAdmin,
    });

    //generate a token for user and send it
    const token = jwt.sign(
      { id: user._id, email, type: type },
      process.env.SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );
    user.token = token;
    user.password = undefined;

    return res.status(200).json({
      message: "You have successfully registered.",
      success: true,
      user,
      token,
    });
  } catch (error) {
    console.log(error);
  }
};

const Login = async (req, res) => {
  try {
    //get all the user details
    const { email, password, type, key } = req.body;

    //check that all the data exists
    if (!(email && password && type)) {
      return res.status(400).json({ message: "Please enter all the information", success: false });
    }

    //find the user in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "User not found",
        success: false,
      });
    }

    //match the password
    const pass = await bcrypt.compare(password, user.password);
    if (!pass) {
      return res.status(401).json({
        message: "Password is incorrect",
        success: false,
      });
    }

    // Admin attempting to log in as user check
    if (user.isAdmin && type !== "Admin") {
      return res.status(401).json({
        message: "Admin cannot log in as a regular user",
        success: false,
      });
    }
    
    //check if the user is admin or not
    if (type == "Admin" && !user.isAdmin) {
      return res.status(401).json({
        message: "You are not an Admin",
        success: false,
      });
    }

    //check if the key is correct when user is admin
    if (type == "Admin" && key != process.env.ADMIN_KEY) {
      return res.status(401).json({
        message: "Admin Secret Key is Incorrect",
        success: false,
      });
    }

    //create token
    const token = jwt.sign(
      { id: user._id, type: type },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );
    user.token = token;
    user.password = undefined;

    //store cookies
    const options = {
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      // secure: true
    };

    //send the token
    res.status(200).cookie("token", token, options).json({
      message: "You have successfully logged in",
      success: true,
      token,
    });
  } catch (error) {
    console.log(error.message);
  }     
};

const Problems =async(req,res)=>{
    try{
        const problems = await Problem.find();
        return res.status(200).json(problems);
    }catch(error){
       return res.status(400).json({ message: "Error fetching problems", error });
    }
};

const ProblemById = async (req, res) => {  
    const { id } = req.params;
    try {
        const problem = await Problem.findById(id);
        if (!problem) {
            return res.status(401).json({ message: "Problem not found" });
        }
        res.status(200).json(problem);
    } catch (error) {
        return res.status(400).json({ message: "Error fetching problem", error });
    }
};

const RunCode = async(req,res)=>{
  const { language="cpp",code, input="" } = req.body;
  
  if(code == undefined){
    return res.status(400).json({
      message:"Code is empty",
      success:false
    });
  }

  try {
    const response = await axios.post(`${compiler_server}/run`,{
      language,
      code, 
      input
    });

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({
      message: "Error "+error.message,
      success: false
    });
  }
};

const controller = {
  Register,
  Login,
  Problems,
  ProblemById,
  RunCode
};

export default controller;
