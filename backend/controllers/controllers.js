import User from "../models/Users.js";
import Problem from "../models/Problems.js";
import Submission from '../models/Submissions.js';
import ContestSubmission from "../models/ContestSubmissions.js";
import Contest from '../models/Contests.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import axios from 'axios';
import { scheduleResultCalculation } from "./utils.js";
import nodemailer from "nodemailer";
dotenv.config();

const compiler_server='https://compiler.codingjudge.online';
const backend_server='https://backend.codingjudge.online';
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
        return res.status(400).json({
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
      secure: true
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
      return res.status(400).json({
        message: "Password is incorrect",
        success: false,
      });
    }

    // Admin attempting to log in as user check
    if (user.isAdmin && type !== "Admin") {
      return res.status(400).json({
        message: "Admin cannot log in as a regular user",
        success: false,
      });
    }
    
    //check if the user is admin or not
    if (type == "Admin" && !user.isAdmin) {
      return res.status(400).json({
        message: "You are not an Admin",
        success: false,
      });
    }

    //check if the key is correct when user is admin
    if (type == "Admin" && key != process.env.ADMIN_KEY) {
      return res.status(400).json({
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
      secure: true
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
            return res.status(400).json({ message: "Problem not found" });
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
  const { problemId, language = "cpp", code,contestId } = req.body;
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
    const testCasesPassed=response.data.index || 0;
    const submission_data={
      user:userId,
      problem:problem._id,
      code,
      language,
      result,
      testCasesPassed
    }

    const new_submission = new Submission(submission_data);
    await new_submission.save();

    await User.findByIdAndUpdate(userId, {
      $push: { submissions: new_submission._id } 
    });
    
    if(contestId){
      const contest_submission_data={
        ...submission_data,
        contest:contestId
      };
      const new_contest_submission = new ContestSubmission(contest_submission_data);
      await new_contest_submission.save();
    }
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

const AllContests=async(req,res)=>{
  try {
    const contests = await Contest.find();
    res.status(200).json(contests);
  } catch (error) {
    res.status(400).json({ message: "Error fetching contests" });
  }
};

const ContestById=async(req,res)=>{
  const {id}=req.params;
  try {
    const contest = await Contest.findById(id);
    if(!contest){
      return res.status(404).json({ message: "Contest not found" });
    }
    res.status(200).json(contest);
  } catch(error){
    res.status(400).json({ message: "Error fetching contest" });
  }
};

const UpdateContest=async(req,res)=>{
  const {id}=req.params;
  const { title, description, startTime, endTime, problems } = req.body;
  try {
    const contest = await Contest.findByIdAndUpdate(id, { title, description, startTime, endTime, problems }, { new: true });
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }
    scheduleResultCalculation(contest._id, contest.endTime);

    res.status(200).json(contest);
  } catch (error) {
    res.status(400).json({ message: "Error Updating contest" });
  }
};

const DeleteContest=async(req,res)=>{
  const {id}=req.params;
  try {
    const contest = await Contest.findByIdAndDelete(id);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }
    await ContestSubmission.deleteMany({ contest: id });
    res.status(200).json({ message: 'Contest deleted successfully' });
  } catch (error) {
    res.status(400).json({message:"Error while deleting the contest"});
  }
};

const CreateContest = async (req, res) => {
  try {
      const { title, description, startTime, endTime ,problems} = req.body;
      if (!title || !description || !startTime || !endTime) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate `problems` field if provided
        if (problems && !Array.isArray(problems)) {
            return res.status(400).json({ message: 'Problems must be an array' });
        }

        if (problems) {
            // Ensure each problem in the array has `problem` ID and `score`
            for (const item of problems) {
                if (!item.problem || typeof item.score !== 'number') {
                    return res.status(400).json({ message: 'Each problem must have a valid `problem` ID and `score`' });
                }
            }
        }
      const newContest = new Contest({ title, description, startTime, endTime,problems});
      await newContest.save();
      scheduleResultCalculation(newContest._id,newContest.endTime);

      res.status(201).json(newContest);
  } catch (error) {
      res.status(500).json({ message: 'Error creating contest', error });
  }
};

const UserContestSubmissions  =async(req,res)=>{
  const {id, userId}=req.params;
  try {
    const submissions = await ContestSubmission.find({ contest: id, user: userId }).populate('user').populate('problem').populate('contest').sort({timestamp:-1});
    res.status(200).json(submissions);
  } catch (error) {
    console.log('Error fetching user submissions:', error);
    res.status(500).json({ message: 'Failed to fetch user submissions' });
  }
};

const GetContestSubmissions=async(req,res)=>{
  const {id} =  req.params;
  try {
    const results = await ContestSubmission.find({ contest: id}).populate('user').populate('problem').populate('contest').sort({timestamp:-1});
    res.status(200).json(results);
  } catch (error) {
    console.log('Error fetching all submissions:', error);
    res.status(501).json({ message: 'Failed to fetch all the contests submissions' });
  }
};

const ContestResults=async(req,res)=>{
  try {
    const { id } = req.params;
    const submissions = await ContestSubmission.find({ contest: id }).populate('problem');
    const contest = await Contest.findById(id).populate({
      path: "problems.problem",
      model: "Problem",
    });
    let results = {};    
  
    submissions.forEach(submission => {
      const userId = submission.user.toString();
      const problemId = submission.problem._id.toString();
      const result = submission.result;
      const testCasesPassed = submission.testCasesPassed || 0;
      const totalTestCases = submission.problem.testcases.length || 1; 

      if (!results[userId]) {
          results[userId] = {
              user: userId,
              totalScore: 0,
              problems: {}
          };
      }

      if (!results[userId].problems[problemId]) {
          results[userId].problems[problemId] = {
              score: 0,
              incorrectAttempts: 0,
              bestPartialScore: 0,
              acceptedSubmission: null
          };
      }
      const problemScoreObj = contest.problems.find(p => p.problem._id.toString() === problemId);
      const problemScore = problemScoreObj ? problemScoreObj.score : 0;

      if (results[userId].problems[problemId].isAccepted) {
          return;
      }

      if (result === 'Accepted') {
          if (!results[userId].problems[problemId].acceptedSubmission || submission.createdAt < results[userId].problems[problemId].acceptedSubmission.createdAt) {
              results[userId].problems[problemId].acceptedSubmission = submission;
              // Calculate the score for the accepted submission
              results[userId].problems[problemId].score = problemScore;
              // No need to process further submissions for this problem
          }
        } else {
            const partialScore = (testCasesPassed / totalTestCases) * problemScore;
            results[userId].problems[problemId].bestPartialScore = Math.max(results[userId].problems[problemId].bestPartialScore, partialScore);
            results[userId].problems[problemId].incorrectAttempts += 1;
        }
    });

    for (const userId in results) {
        const userResults = results[userId];
        let totalScore = 0;

        for (const problemId in userResults.problems) {
            const problemData = userResults.problems[problemId];
            const problemScoreObj = contest.problems.find(p => p.problem._id.toString() === problemId);
            const problemScore = problemScoreObj ? problemScoreObj.score : 0;

            const incorrectPenalty = problemData.incorrectAttempts * 10;
            if (problemData.acceptedSubmission) {
                // Apply penalty for incorrect submissions before the accepted one
                totalScore += Math.max(0, problemScore - incorrectPenalty);
                results[userId].problems[problemId].bestScore = Math.max(problemScore - incorrectPenalty,0);
            } else {
                // No accepted submission: use the best partial score and apply penalty
                totalScore += Math.max(0, problemData.bestPartialScore - incorrectPenalty);
                results[userId].problems[problemId].bestScore = Math.max(problemData.bestPartialScore - incorrectPenalty,0);
            }
        }
        userResults.totalScore = totalScore;
    }
    
    let resultsArray = Object.values(results);
    resultsArray.sort((a, b) => b.totalScore - a.totalScore);
    
    for (let result of resultsArray) {
      const user = await User.findById(result.user).select('firstname email');
      result.firstname = user.firstname;
      result.email = user.email;
  
      // Map through the problem IDs in result.problems
      result.problems = Object.keys(result.problems).map(problemId => ({
          problem: problemId,
          score: result.problems[problemId] ? result.problems[problemId].bestScore : 0
      }));
    }
  
    contest.results = resultsArray.map(result => ({
        user: result.user,
        firstname: result.firstname,
        email: result.email,
        score: result.totalScore,
        problems: result.problems
    }));  

    await contest.save();
    res.status(200).json(contest.results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const registerForContest = async (req, res) => {
  try {
      const { id } = req.params;  
      const userId = req.user.id;
      const contest = await Contest.findById(id);
      if (!contest) {
          return res.status(404).json({ message: 'Contest not found' });
      }
      const isRegistered = contest.participants.some(participant => participant.equals(userId));
      if (isRegistered) {
          return res.status(400).json({ message: 'User is already registered for this contest' });
      }
      contest.participants.push(userId);
      await contest.save();

      res.status(200).json({ message: 'Successfully registered for the contest' });
  } catch (error) {
      console.log('Error registering for contest:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

const checkRegistration = async (req,res) => {
  try {
    const {id}=req.params;
    const userId = req.user.id;

    const contest = await Contest.findById(id);
    if(!contest){
      return res.status(404).json({ message: 'Contest not found' });
    }

    const isRegistered = contest.participants.some(participant => participant.equals(userId));
    res.status(200).json({isRegistered});
  } catch (error) {
    console.log("Error while checking registration ",error); 
    res.status(500).json({ message: 'Internal server error' });
  }
};

const DeleteContestSubmission = async (req, res) => {
  try {
      const { id, problemId } = req.params;
      console.log("deleting contest submissions");
      const contest = await Contest.findById(id);
      if (!contest) {
          return res.status(404).json({ message: 'Contest not found' });
      }
      const result = await ContestSubmission.deleteMany({ contest: id, problem: problemId });
      if(result.deletedCount > 0){
        console.log("Contest submissions deleted successfully");
      }
      return res.status(200).json({ message: 'Contest submissions deleted successfully' });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred while deleting contest submissions' });
  }
};

const ForgetPassword=async(req,res)=>{
  const {email}=req.body;
  try {
    const old= await User.findOne({email});
    if(!old){
      return res.status(400).json({message:"User does not exist!"});
    }
    const secret=process.env.SECRET_KEY+old.password;
    const token=jwt.sign({id:old._id,email:old.email},secret ,{expiresIn:"1d"});
    const link=`${backend_server}/reset/${old._id}/${token}`;

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'noreplycodingjudge@gmail.com',
        pass: 'syvfkixqtlbspyos'
      }
    });
    
    var mailOptions = {
      from: 'youremail@gmail.com',
      to: `${email}`,
      subject: 'Password Reset',
      text: `link to change your password - ${link}`
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.status(200).json({message:"Email sent successfully",
      success:true
    });  
  } catch (error) {
    return res.status(401).json({message:"Error while clicking forget password"});
  }
};

const getResetPassword=async(req,res)=>{
  const {id, token}=req.params;
  const old= await User.findOne({_id:id});
  if(!old){
    return res.status(400).json({message:"User does not exist!"});
  }
  const secret=process.env.SECRET_KEY+old.password;
  try {
    const verify=jwt.verify(token,secret);
    return res.render("index",{email:verify.email,status:"Not verified"});
  } catch (error) {
    console.log(error);
    return res.status(401).json({message:"Error while verifying the token"});
  }
};

const postResetPassword=async(req,res)=>{
  const {id, token}=req.params;
  const {password,confirmPassword}=req.body;
  if(password!=confirmPassword){
    return res.status(401).json({message:"Password and Confirm Password do not match"});
  }
  const old= await User.findOne({_id:id});
  if(!old){
    return res.status(400).json({message:"User does not exist!"});
  }
  const secret=process.env.SECRET_KEY+old.password;
  try {
    const verify=jwt.verify(token,secret);
    const encryptedPassword=await bcrypt.hash(password,10);
    await User.updateOne({_id:id,},{ $set: { password: encryptedPassword, }, });
    return res.render("index",{email:verify.email,status:"verified"});
  } catch (error) {
    console.log(error);
    return res.status(401).json({message:"Error while updating the password"});
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
  Submissions,
  AllContests,
  ContestById,
  UpdateContest,
  DeleteContest,
  CreateContest,
  UserContestSubmissions,
  GetContestSubmissions,
  ContestResults,
  registerForContest,
  checkRegistration,
  DeleteContestSubmission,
  ForgetPassword,
  getResetPassword,
  postResetPassword
};

export default controller;
