import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionNumber: {
    type: Number,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  options: [{
    text: String,
    score: Number
  }]
}, { _id: false });

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: '/eduSoft_logo.png'
  },
  category: {
    type: String,
    enum: [
      'presentation',
      'leadership',
      'problem-solving',
      'teamwork',
      'adaptability',
      'communication'
    ],
    required: true,
    unique: true
  },
  duration: {
    type: Number,  // in minutes
    default: 30
  },
  questions: [questionSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create indexes
assessmentSchema.index({ category: 1 }, { unique: true });

const Assessment = mongoose.model('Assessment', assessmentSchema);

// Create default assessments if they don't exist
const createDefaultAssessments = async () => {
  const defaultAssessments = [
    {
      title: 'Presentation Skills Assessment',
      description: 'Record video responses to presentation questions. You will have 20 seconds to prepare for each question and 1 minute to record your answer. Please be in a quiet place with your camera ready. Your responses will be evaluated by a supervisor.',
      category: 'presentation',
      duration: 10,
      questions: []  // Questions are stored in PresentationQuestion model and fetched dynamically
    },
    {
      title: 'Leadership Skills Assessment',
      description: 'Assess your leadership capabilities and potential to guide and inspire others.',
      category: 'leadership',
      duration: 30,
      questions: [
        {
          questionNumber: 1,
          questionText: 'How often do you take initiative in group projects?',
          options: [
            { text: 'Rarely or never', score: 1 },
            { text: 'Occasionally', score: 2 },
            { text: 'Sometimes', score: 3 },
            { text: 'Often', score: 4 },
            { text: 'Always', score: 5 }
          ]
        },
        {
          questionNumber: 2,
          questionText: 'How comfortable are you with making decisions that affect others?',
          options: [
            { text: 'Very uncomfortable', score: 1 },
            { text: 'Somewhat uncomfortable', score: 2 },
            { text: 'Neutral', score: 3 },
            { text: 'Somewhat comfortable', score: 4 },
            { text: 'Very comfortable', score: 5 }
          ]
        },
        {
          questionNumber: 3,
          questionText: 'How well do you handle feedback and criticism?',
          options: [
            { text: 'Very poorly', score: 1 },
            { text: 'Somewhat poorly', score: 2 },
            { text: 'Neutral', score: 3 },
            { text: 'Somewhat well', score: 4 },
            { text: 'Very well', score: 5 }
          ]
        },
        {
          questionNumber: 4,
          questionText: 'How effectively do you delegate tasks to team members?',
          options: [
            { text: 'Not effective at all', score: 1 },
            { text: 'Slightly effective', score: 2 },
            { text: 'Moderately effective', score: 3 },
            { text: 'Very effective', score: 4 },
            { text: 'Extremely effective', score: 5 }
          ]
        },
        {
          questionNumber: 5,
          questionText: 'How well do you communicate your vision to others?',
          options: [
            { text: 'Very poorly', score: 1 },
            { text: 'Somewhat poorly', score: 2 },
            { text: 'Neutral', score: 3 },
            { text: 'Somewhat well', score: 4 },
            { text: 'Very well', score: 5 }
          ]
        }
      ]
    },
    {
      title: 'Problem Solving Skills Assessment',
      description: 'Test your ability to analyze complex problems and develop effective solutions.',
      category: 'problem-solving',
      duration: 45,
      questions: []
    },
    {
      title: 'Teamwork Skills Assessment',
      description: 'Evaluate your ability to work effectively in a team environment.',
      category: 'teamwork',
      duration: 25,
      questions: []
    },
    {
      title: 'Adaptability & Flexibility Assessment',
      description: 'Assess your ability to adapt to change and handle unexpected situations.',
      category: 'adaptability',
      duration: 20,
      questions: []
    },
    {
      title: 'Communication Skills Assessment',
      description: 'Evaluate your verbal and written communication abilities.',
      category: 'communication',
      duration: 30,
      questions: []
    }
  ];

  try {
    // Delete any existing assessments first
    await Assessment.deleteMany({});
    
    // Insert the default assessments
    await Assessment.insertMany(defaultAssessments);
    console.log('Default assessments created successfully');
  } catch (error) {
    console.error('Error creating default assessments:', error);
  }
};

// Run the function to create default assessments
createDefaultAssessments();

export default Assessment;