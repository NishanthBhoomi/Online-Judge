import User from "../models/Users.js";
import Problem from "../models/Problems.js";
import Submission from '../models/Submissions.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import axios from 'axios';
dotenv.config();

const compiler_server='http://compiler:5000';

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
    
    const options = {
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      // secure: true
    };

    return res.status(200).cookie("token", token, options).json({
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
      id:user._id
    });
  } catch (error) {
    console.log(error.message);
  }     
};

const Logout=async(req, res) => {
  res.clearCookie('token');
  res.status(200).send({ message: 'Logged out successfully' });
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
  const { problemId,language="cpp",code, input="" } = req.body;
  
  if(code == undefined){
    return res.status(400).json({
      message:"Code is empty",
      success:false
    });
  }

  try {
    const problem = await Problem.findById(problemId);
    if(!problem){
      return res.status(400).json({
        message: "Problem not found",
        success: false
      });
    }
    const time=problem.timeConstraints;
    const space=problem.spaceConstraints;
    const response = await axios.post(`${compiler_server}/run`,{
      time,
      space,
      language,
      code, 
      input
    });

    res.status(200).json(response.data);
  } catch (error) {
   if(error && error.response && error.response.data) return res.status(500).json({
      message: "Error " +error.message,
      type:error.response.data.type,
      error_message:error.response.data.message,
      success: false
    });
    return res.status(500).json({
      message: "Error " +error.message,
      success: false
    });
  }
};

const SubmitCode = async(req,res)=>{
  const { problemId, language = "cpp", code } = req.body;
  const userId=req.user.id;
  if (!code) {
      return res.status(400).json({
          message: "Code is empty",
          success: false
      });
  }

  try {
    const problem = await Problem.findById(problemId);
    if(!problem){
      return res.status(400).json({
        message: "Problem not found",
        success: false
      });
    }
    const payload ={
      problem,
      language,
      code,
    };

    const response = await axios.post(`${compiler_server}/submit`,payload);
    const result = response.data.type || 'Unknown'; 
    const submission_data={
      user:userId,
      problem:problem._id,
      code,
      language,
      result
    }

    const new_submission = new Submission(submission_data);
    await new_submission.save();

    await User.findByIdAndUpdate(userId, {
      $push: { submissions: new_submission._id } 
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.log("Error while submitting code ",error);
    if(error && error.response && error.response.data)  return res.status(400).json({
        message: 'Error while submitting code',
        success: false,
        error_message: error.response.data.message,
        type: error.response.data.type  
    });
    return res.status(400).json({
      message: 'Error while submitting code',
      success: false,
    });
  }
};

const AllUsers=async(req,res)=>{
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.log("Error while fetching all the users ",error);
    res.status(400).json({
      message:"Error while fetching all the users",
      success:false,
    });
  }
};

const DeleteUser=async(req,res)=>{
  const { id } = req.params;
  try {
      await User.findByIdAndDelete(id);
      res.status(204).json({ message: 'User deleted' });
  } catch (error) {
      res.status(404).json({ message: 'User was not found' });
  }
};

const UpdateUser=async(req,res)=>{
  const { id } = req.params;
  const { firstname, lastname, UserType } = req.body;
  const isAdmin = UserType == 'Admin';
  try {
      const updatedUser = await User.findByIdAndUpdate(id, { firstname, lastname, UserType,isAdmin }, { new: true });
      res.status(200).json(updatedUser);
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
};

const Profile=async(req,res)=>{
  const { id } = req.user;
  try {
    const user = await User.findById(id);
    if(!user){
      return res.status(401).json({ message: "User not found" ,success:false});  
    }
    res.status(200).json({firstname:user.firstname,lastname:user.lastname,email:user.email,UserType:user.UserType,user});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const UpdateProfile=async(req,res)=>{
  const { id } = req.user;
  const { firstname, lastname, email, UserType } = req.body;
  try {
    const user = await User.findByIdAndUpdate(id, { firstname, lastname, email}, { new: true });
    res.status(200).json({success:true,firstname:user.firstname,lastname:user.lastname,email:user.email,UserType:user.UserType});
  }catch(error){
    res.status(400).json({ message: error.message });
  }
};

const UpdateProblem=async(req,res)=>{
  const {id}=req.params;
  const { title, description, difficulty, constraints, timeConstraints, spaceConstraints, inputFormat, outputFormat, examples, testcases } = req.body;
  try {
    const problem = await Problem.findByIdAndUpdate(id, { title, description, difficulty, constraints, timeConstraints, spaceConstraints, inputFormat, outputFormat, examples, testcases }, 
      { new: true,runValidators:true});
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.status(200).json(problem);
  } catch (error) {
    res.status(400).json({ message: "Error Updating problem" });
  }
};

const DeleteProblem=async(req,res)=>{
  const {id}=req.params;
  try {
    const problem = await Problem.findByIdAndDelete(id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.status(200).json({ message: 'Problem deleted successfully' });
  } catch (error) {
    res.status(400).json({message:"Error while deleting the problem"});
  }
};

const AddProblem=async(req,res)=>{
  const { title, description, difficulty, constraints, timeConstraints, spaceConstraints, inputFormat, outputFormat, examples, testcases } = req.body;
  try {
    const problem = await Problem.create({ title, description, difficulty, constraints, timeConstraints, spaceConstraints, inputFormat, outputFormat, examples, testcases });
    res.status(200).json(problem);
  } catch (error) {
    res.status(400).json({ message: "Error while adding problem" });
  }
};

const SubmissionsbyId= async(req,res)=>{
  const {id}=req.params;
  try {
    const submissions= await Submission.find({user:req.user.id,problem:id}).populate('user').populate('problem').sort({timestamp:-1});
    res.status(200).json(submissions); 
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

const Submissions= async(req,res)=>{
  try {
    const submissions= await Submission.find({user:req.user.id}).populate('user').populate('problem').sort({timestamp:-1});
    res.status(200).json(submissions); 
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

const controller = {
  Register,
  Login,
  Logout,
  Problems,
  ProblemById,
  RunCode,
  SubmitCode,
  AllUsers,
  DeleteUser,
  UpdateUser,
  Profile,
  UpdateProfile,
  UpdateProblem,
  DeleteProblem,
  AddProblem,
  SubmissionsbyId,
  Submissions
};

export default controller;
