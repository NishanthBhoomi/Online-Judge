import mongoose from 'mongoose';

const contestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    problems: [
        {
          problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
          score: { type: Number, required: true },
        },
    ],
    participants:  [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],  
    results: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        firstname: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
        },
        score: {
          type: Number,
          required: true,
        },
        problems: [{
          problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
          score: {
            type: Number,
            required: true,
          }
        }]
    }]
}, {
    timestamps: true,
});

contestSchema.index({ endTime: 1 });

const Contests = mongoose.model('Contest', contestSchema);
export default Contests;