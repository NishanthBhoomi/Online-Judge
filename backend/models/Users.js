import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  UserType: {
    type: String,
    default: "User",
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  submissions:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Submission',
  }],
});

const User = mongoose.model('User', userSchema);
export default User;