import Submission from '../models/Submissions.js';

const calculateContestResults = async (contestId) => {
    // Fetch all submissions and calculate results based on your criteria
    const submissions = await Submission.find({ contestId });

    // Example calculation (you should adjust according to your contest rules)
    const results = submissions
        .reduce((acc, sub) => {
            if (!acc[sub.userId]) {
                acc[sub.userId] = { userId: sub.userId, score: 0 };
            }
            acc[sub.userId].score += sub.score;  // Assuming `score` field exists in `Submission`
            return acc;
        }, {});

    // Convert to array and sort by score
    const sortedResults = Object.values(results).sort((a, b) => b.score - a.score);

    return sortedResults;
};

export default calculateContestResults;