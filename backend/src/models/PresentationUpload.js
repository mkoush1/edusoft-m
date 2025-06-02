import mongoose from 'mongoose';

const PresentationUploadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PresentationAssessment',
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  videoPublicId: {
    type: String,
    required: true
  },
  presentationUrl: {
    type: String,
    required: true
  },
  presentationPublicId: {
    type: String,
    required: true
  },
  presentationType: {
    type: String,
    enum: ['pdf', 'pptx', 'ppt'],
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'error'],
    default: 'pending'
  },
  metadata: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

// Check if model already exists to prevent OverwriteModelError
let PresentationUpload;
try {
  PresentationUpload = mongoose.model('PresentationUpload');
} catch (e) {
  PresentationUpload = mongoose.model('PresentationUpload', PresentationUploadSchema);
}

export default PresentationUpload;
