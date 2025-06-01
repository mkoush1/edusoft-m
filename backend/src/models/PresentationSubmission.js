import mongoose from 'mongoose';

const slideSchema = new mongoose.Schema({
    slideNumber: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    notes: { type: String }
}, { _id: false });

const evaluationCriteriaSchema = new mongoose.Schema({
    contentClarity: {
        score: { type: Number, min: 0, max: 100 },
        feedback: { type: String }
    },
    engagement: {
        score: { type: Number, min: 0, max: 100 },
        feedback: { type: String }
    },
    impact: {
        score: { type: Number, min: 0, max: 100 },
        feedback: { type: String }
    },
    overallScore: { type: Number, min: 0, max: 100 }
}, { _id: false });

const presentationSubmissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String
    },
    questionId: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    presentationFile: {
        fileId: { type: String },
        name: { type: String },
        downloadLink: { type: String },
        webViewLink: { type: String },
        size: { type: Number },
        mimeType: { type: String },
        uploadedAt: { type: Date }
    },
    slides: [slideSchema],
    screenRecording: {
        url: { type: String, required: true },
        thumbnailUrl: { type: String },
        duration: { type: Number },
        size: { type: Number }
    },
    webcamRecording: {
        url: { type: String },
        thumbnailUrl: { type: String },
        duration: { type: Number }
    },
    combinedRecording: {
        url: { type: String },
        thumbnailUrl: { type: String },
        duration: { type: Number }
    },
    evaluation: {
        type: evaluationCriteriaSchema,
        default: null
    },
    evaluatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    evaluationDate: { type: Date },
    evaluationNotes: { type: String },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'under_review', 'evaluated'],
        default: 'draft'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    criteriaScores: {
        contentClarity: {
            type: Number,
            min: 0,
            max: 10,
            default: 0
        },
        engagementDelivery: {
            type: Number,
            min: 0,
            max: 10,
            default: 0
        },
        impactEffectiveness: {
            type: Number,
            min: 0,
            max: 10,
            default: 0
        }
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
    },
    slideTimings: [{
        slideNumber: { type: Number },
        startTime: { type: Number },
        duration: { type: Number }
    }],
    speechAnalysis: {
        wordCount: { type: Number },
        speakingRate: { type: Number },
        fillerWords: { type: Number },
        transcript: { type: String }
    }
}, {
    timestamps: true
});

// Index for faster queries
presentationSubmissionSchema.index({ userId: 1, status: 1 });
presentationSubmissionSchema.index({ questionId: 1, status: 1 });

const PresentationSubmission = mongoose.model('PresentationSubmission', presentationSubmissionSchema);
export default PresentationSubmission;