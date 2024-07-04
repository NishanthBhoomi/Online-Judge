import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  constraints: {
    type: String,
    required: true,
  },
  timeConstraints: {
    type: String,
    required: true,
  },
  spaceConstraints: {
    type: String,
    required: true,
  },
  inputFormat: {
    type: String,
    required: true,
  },
  outputFormat: {
    type: String,
    required: true,
  },
  examples: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true },
    },
  ],
  testcases: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true },
    },
  ],
});

const Problem = mongoose.model("Problem", problemSchema);
export default Problem;
