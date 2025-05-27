import mongoose from 'mongoose';

const presentationSubmissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questionId: {
        type: Number,
        required: true
    },
    videoPath: {
        type: String,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    score: {
        type: Number,
        min: 0,
        max: 100
    },
    feedback: {
        type: String
    },
    reviewedAt: {
        type: Date
    }
});

const PresentationSubmission = mongoose.model('PresentationSubmission', presentationSubmissionSchema);

export default PresentationSubmission; 