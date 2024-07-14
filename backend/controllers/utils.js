import schedule from 'node-schedule';
import ContestSubmission from "../models/ContestSubmissions.js";
import Contest from '../models/Contests.js';
import User from '../models/Users.js';

const calculateAndSaveResults = async (contestId) => {
    const contest = await Contest.findById(contestId).populate({
      path: "problems.problem",
      model: "Problem",
    });

    if (!contest) return;

    const submissions = await ContestSubmission.find({ contest: contest._id }).populate('problem');
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
};

const scheduleResultCalculation = (contestId, endTime) => {
    const endTimeDate = new Date(endTime);
    const offset = 5.5 * 60 * 60 * 1000; 
    const localEndTime = new Date(endTimeDate.getTime() - offset); 
    schedule.scheduleJob(localEndTime, () => calculateAndSaveResults(contestId));
};

export { scheduleResultCalculation };