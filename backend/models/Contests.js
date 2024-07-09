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
    problems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    isPublished: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    results: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        score: {
            type: Number,
            default: 0,
        },
        submissionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Submission',
        },
    }],
}, {
    timestamps: true,
});

const Contests = mongoose.model('Contest', contestSchema);
export default Contests;