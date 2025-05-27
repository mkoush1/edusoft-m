import mongoose from 'mongoose';
import AdaptabilityAssessmentQuestion from '../models/AdaptabilityAssessmentQuestion.js';
import dotenv from 'dotenv';
dotenv.config();

const questions = [
  // SJT Questions (1-20)
  {
    questionNumber: 1,
    section: 'SJT',
    questionText: 'The work system in your organization has suddenly changed, requiring you to learn completely new procedures within one week.',
    questionType: 'SJT',
    maxScore: 2,
    options: [
      { text: 'Request postponement of the new system implementation until you can learn better.', value: 0, effectiveness: 'NEUTRAL' },
      { text: 'Dedicate extra time after work hours to practice with the new system.', value: 1.5, effectiveness: 'MEDIUM' },
      { text: 'Focus on learning the core functions first, then gradually learn the advanced features.', value: 2, effectiveness: 'MOST' },
      { text: 'Rely on your colleagues to handle tasks requiring the new system.', value: 1, effectiveness: 'LEAST' }
    ]
  },
  {
    questionNumber: 2,
    section: 'SJT',
    questionText: 'While working on an important project, the allocated budget has been reduced by 30% while maintaining the same scope and deadline.',
    questionType: 'SJT',
    maxScore: 2,
    options: [
      { text: 'Request an extension of the deadline due to the budget reduction.', value: 0, effectiveness: 'NEUTRAL' },
      { text: 'Reduce the project scope to adapt to the reduced budget.', value: 1, effectiveness: 'LEAST' },
      { text: 'Redesign the project plan to identify priority tasks and find more efficient ways to execute them.', value: 2, effectiveness: 'MOST' },
      { text: 'Seek additional resources from other departments to compensate for the budget shortfall.', value: 1.5, effectiveness: 'MEDIUM' }
    ]
  },
  {
    questionNumber: 3,
    section: 'SJT',
    questionText: `You've been transferred to a new project requiring completely different skills from your previous experience, and you have only two weeks to prepare.`,
    questionType: 'SJT',
    maxScore: 2,
    options: [
      { text: 'Request intensive training from HR during the two weeks.', value: 1, effectiveness: 'LEAST' },
      { text: 'Connect with current team members for guidance and learning resources.', value: 1.5, effectiveness: 'MEDIUM' },
      { text: 'Identify the core skills required and focus on developing them first, with a plan for continuous learning.', value: 2, effectiveness: 'MOST' },
      { text: 'Request to delay joining the project until you acquire the necessary skills.', value: 0, effectiveness: 'NEUTRAL' }
    ]
  },
  {
    questionNumber: 4,
    section: 'SJT',
    questionText: 'During an important presentation, the projector malfunctions and you cannot display the slides you prepared.',
    questionType: 'SJT',
    maxScore: 2,
    options: [
      { text: 'Postpone the presentation until the technical issue is resolved.', value: 0, effectiveness: 'NEUTRAL' },
      { text: 'Continue the presentation verbally, describing the visual content that was planned.', value: 1.5, effectiveness: 'NEUTRAL' },
      { text: 'Distribute printed copies of the slides if available, and continue with the explanation.', value: 2, effectiveness: 'MOST' },
      { text: 'Quickly summarize the main points and end the presentation early.', value: 1, effectiveness: 'LEAST' }
    ]
  },
  {
    questionNumber: 5,
    section: 'SJT',
    questionText: 'Your daily meeting schedule has been suddenly changed, resulting in a conflict between two important meetings.',
    questionType: 'SJT',
    maxScore: 2,
    options: [
      { text: 'Attend the first meeting and delegate a colleague to attend the second one.', value: 1.5, effectiveness: 'MEDIUM' },
      { text: 'Evaluate the importance of each meeting and choose the more important one, requesting a summary of the other.', value: 2, effectiveness: 'MOST' },
      { text: 'Try to reschedule one of the meetings by coordinating with the organizers.', value: 1, effectiveness: 'LEAST' },
      { text: 'Attend part of each meeting, moving between them.', value: 0, effectiveness: 'NEUTRAL' }
    ]
  },
  {
    questionNumber: 6,
    section: 'SJT',
    questionText: 'While working on a project, you discover that the tools you usually use are unavailable, and the deadline is in two days.',
    questionType: 'SJT',
    maxScore: 2,
    options: [
      { text: 'Request an extension of the deadline until the usual tools become available.', value: 0, effectiveness: 'NEUTRAL' },
      { text: 'Search for alternative tools that can perform the same function, even if less efficiently.', value: 1.5, effectiveness: 'MEDIUM' },
      { text: 'Modify your work plan to use available resources in an innovative way.', value: 2, effectiveness: 'MOST' },
      { text: 'Delegate the task to a colleague who has the appropriate tools.', value: 1, effectiveness: 'LEAST' }
    ]
  },
  {
    questionNumber: 7,
    section: 'SJT',
    questionText: `You've been assigned a new project with a very limited budget that is insufficient for traditional resources.`,
    questionType: 'SJT',
    maxScore: 2,
    options: [
      { text: 'Decline the project due to insufficient resources.', value: 0, effectiveness: 'NEUTRAL' },
      { text: 'Search for open-source or low-cost resources that can be used.', value: 1.5, effectiveness: 'MEDIUM' },
      { text: 'Redesign the project scope to match available resources.', value: 1, effectiveness: 'LEAST' },
      { text: 'Collaborate with other teams to share resources and reduce costs.', value: 2, effectiveness: 'MOST' }
    ]
  },
  {
    questionNumber: 8,
    section: 'SJT',
    questionText: 'While traveling to an important meeting, you lose your laptop containing your presentation, and the meeting is tomorrow.',
    questionType: 'SJT',
    maxScore: 2,
    options: [
      { text: 'Apologize for the meeting and request rescheduling.', value: 0, effectiveness: 'NEUTRAL' },
      { text: 'Borrow a laptop and recreate the presentation from memory.', value: 1.5, effectiveness: 'MEDIUM' },
      { text: `Contact your colleagues to send a copy of the presentation if it's available in the cloud.`, value: 2, effectiveness: 'MOST' },
      { text: 'Convert the meeting to an open discussion instead of a presentation.', value: 1, effectiveness: 'LEAST' }
    ]
  },
  {
    questionNumber: 9,
    section: 'SJT',
    questionText: `You're working on a project requiring specialized software, but the license has suddenly expired and won't be renewed for a week.`,
    questionType: 'SJT',
    maxScore: 2,
    options: [
      { text: 'Postpone work on the project until the license is renewed.', value: 0, effectiveness: 'NEUTRAL' },
      { text: 'Look for a trial version or temporary alternative to the software.', value: 1.5, effectiveness: 'MEDIUM' },
      { text: `Reorganize your work plan to focus on tasks that don't require this software during this week.`, value: 2, effectiveness: 'MOST' },
      { text: 'Use an unlicensed version of the software temporarily.', value: 1, effectiveness: 'LEAST' }
    ]
  },
  {
    questionNumber: 10,
    section: 'SJT',
    questionText: 'Your team has been reduced by 50% while maintaining the same workload and deadlines.',
    questionType: 'SJT',
    maxScore: 2,
    options: [
      { text: 'Demand hiring new employees to compensate for the shortage.', value: 0, effectiveness: 'NEUTRAL' },
      { text: 'Redistribute tasks based on priorities and the capabilities of the remaining team.', value: 2, effectiveness: 'MOST' },
      { text: 'Automate some routine tasks to save time and effort.', value: 1.5, effectiveness: 'MEDIUM' },
      { text: 'Simplify processes and remove unnecessary steps.', value: 1 , effectiveness: 'LEAST' }
    ]
  },
  {
    questionNumber: 11,
    section: 'SJT',
    questionText: `You've been assigned to work with a colleague known for a very direct and blunt communication style, while you prefer a diplomatic approach.`,
    questionType: 'SJT',
    maxScore: 2,
    options: [
      { text: 'Request to work with someone else whose style matches yours.', value: 0, effectiveness: 'NEUTRAL' },
      { text: 'Talk with the colleague about the difference in communication styles and find a middle ground.', value: 2, effectiveness: 'MOST' },
      { text: 'Adjust your communication style to be more direct when dealing with this colleague.', value: 1.5, effectiveness: 'MEDIUM' },
      { text: 'Avoid direct communication and use email instead.', value: 1, effectiveness: 'LEAST' }
    ]
  },
  {
    questionNumber: 12,
    section: 'SJT',
    questionText: `You've joined a new team where everyone prefers to work independently, while you're accustomed to close collaboration.`,
    questionType: 'SJT',
    maxScore: 2,
    options: [
      { text: 'Try to convince the team to change their working style to be more collaborative.', value: 1, effectiveness: 'LEAST' },
      { text: 'Adapt to the independent work style while maintaining open communication channels.', value: 1.5, effectiveness: 'MEDIUM' },
      { text: 'Request a transfer to another team that adopts a collaborative work style.', value: 0, effectiveness: 'NEUTRAL' },
      { text: 'Suggest a mix of independent work and regular collaborative meetings.', value: 2, effectiveness: 'MOST' }
    ]
  },
  {
    questionNumber: 13,
    section: 'SJT',
    questionText: `You're working with a client who constantly changes requirements and expects immediate implementation of changes.`,
    questionType: 'SJT',
    maxScore: 2,
    options: [
      { text: 'Refuse the frequent changes and ask for adherence to the original requirements.', value: 1, effectiveness: 'LEAST' },
      { text: 'Establish a formal change management process with clear timelines.', value: 2, effectiveness: 'MOST' },
      { text: 'Accept all changes without discussion to please the client.', value: 0, effectiveness: 'NEUTRAL' },
      { text: 'Prioritize changes and implement them gradually while keeping the client informed.', value: 1.5, effectiveness: 'MEDIUM' }
    ]
  },
  {
    questionNumber: 14,
    section: 'SJT',
    questionText: 'A new manager has been appointed to your team with a leadership style completely different from the previous manager.',
    questionType: 'SJT',
    maxScore: 2,
    options: [
      { text: 'Stick to the work methods you were accustomed to with the previous manager.', value: 0, effectiveness: 'NEUTRAL' },
      { text: 'Request a meeting with the new manager to understand their expectations and work style.', value: 2, effectiveness: 'MOST' },
      { text: `Observe the manager's interaction with other colleagues to understand their style before adapting.`, value: 1.5, effectiveness: 'MEDIUM' },
      { text: 'Talk with your colleagues to form a unified response to the new manager\'s style.', value: 1, effectiveness: 'LEAST' }
    ]
  },
  {
    questionNumber: 15,
    section: 'SJT',
    questionText: 'During an important meeting, you presented an idea that was strongly criticized by a colleague.',
    questionType: 'SJT',
    maxScore: 2,
    options: [
      { text: 'Strongly defend your idea and insist on its validity.', value: 1, effectiveness: 'LEAST' },
      { text: 'Withdraw the idea and refrain from participating in the rest of the meeting.', value: 0, effectiveness: 'NEUTRAL' },
      { text: 'Listen to the criticism openly and ask for specific suggestions for improvement.', value: 2, effectiveness: 'MOST' },
      { text: 'Ignore the criticism and move on to another topic.', value: 1.5, effectiveness: 'MEDIUM' }
    ]
  },
  {
    questionNumber: 16,
    section: 'SJT',
    questionText: `You've been transferred to work in an international branch where the work culture differs significantly from your original culture.`,
    questionType: 'SJT',
    maxScore: 2,
    options: [
      { text: 'Stick to the work methods you were accustomed to in your original culture.', value: 0, effectiveness: 'NEUTRAL' },
      { text: 'Research information about the new work culture and adapt to it gradually.', value: 1.5, effectiveness: 'MEDIUM' },
      { text: 'Request formal training about the new culture before starting.', value: 1, effectiveness: 'LEAST' },
      { text: 'Connect with local colleagues to understand cultural differences and seek their guidance.', value: 2, effectiveness: 'MOST' }
    ]
  },
  {
    questionNumber: 17,
    section: 'SJT',
    questionText: `You're working on an international project with a multicultural team and notice differences in communication and work styles.`,
    questionType: 'SJT',
    maxScore: 2,
    options: [
      { text: 'Suggest adopting a unified work style that suits everyone.', value: 1, effectiveness: 'LEAST' },
      { text: `Adapt to different communication styles and adjust your approach depending on who you're dealing with.`, value: 2, effectiveness: 'MOST' },
      { text: 'Focus only on tasks and avoid cultural differences.', value: 0, effectiveness: 'NEUTRAL' },
      { text: 'Organize a workshop on cultural diversity to increase awareness among team members.', value: 1.5, effectiveness: 'MEDIUM' }
    ]
  },
  {
    questionNumber: 18,
    section: 'SJT',
    questionText: `You've been tasked with presenting to clients from a culture completely different from yours.`,
    questionType: 'SJT',
    maxScore: 2,
    options: [
      { text: 'Deliver the presentation in your usual style, focusing on content quality.', value: 0, effectiveness: 'NEUTRAL' },
      { text: 'Research cultural differences and adjust your presentation style to meet client expectations.', value: 2, effectiveness: 'MOST' },
      { text: 'Ask a colleague from the same culture as the clients to deliver the presentation.', value: 1, effectiveness: 'LEAST' },
      { text: 'Deliver a culturally neutral presentation focusing only on facts and figures.', value: 1.5, effectiveness: 'MEDIUM' }
    ]
  },
  {
    questionNumber: 19,
    section: 'SJT',
    questionText: 'You work in a multicultural environment and notice recurring misunderstandings between team members from different backgrounds.',
    questionType: 'SJT',
    maxScore: 2,
    options: [
      { text: `Ignore the misunderstandings as long as they don't directly affect your work.`, value: 0, effectiveness: 'NEUTRAL' },
      { text: 'Suggest creating a communication guide that explains cultural differences and how to handle them.', value: 1.5, effectiveness: 'MEDIUM' },
      { text: 'Intervene as a mediator when misunderstandings occur to clarify different perspectives.', value: 2, effectiveness: 'MOST' },
      { text: 'Encourage informal communication between team members to build cultural understanding.', value: 1, effectiveness: 'LEAST' }
    ]
  },
  {
    questionNumber: 20,
    section: 'SJT',
    questionText: `You've been transferred to work in a new country where meeting and discussion rules differ significantly from what you're used to.`,
    questionType: 'SJT',
    maxScore: 2,
    options: [
      { text: 'Stick to your usual style of participation in meetings.', value: 0, effectiveness: 'NEUTRAL' },
      { text: 'Observe silently at first to understand meeting dynamics before actively participating.', value: 2, effectiveness: 'MOST' },
      { text: 'Directly ask your manager about the unwritten rules for meetings.', value: 1.5, effectiveness: 'MEDIUM' },
      { text: 'Gradually adapt to the new style while maintaining your personal strengths.', value: 1, effectiveness: 'LEAST' }
    ]
  },
  // Likert Scale Questions (21-40)
  {
    questionNumber: 21,
    section: 'Likert',
    questionText: 'I can consider multiple perspectives when facing a complex problem.',
    questionType: 'Likert',
    maxScore: 5,
    isReverseScored: false,
    options: [
      { text: 'Strongly Disagree', value: 1 },
      { text: 'Disagree', value: 2 },
      { text: 'Neither Agree nor Disagree', value: 3 },
      { text: 'Agree', value: 4 },
      { text: 'Strongly Agree', value: 5 }
    ]
  },
  {
    questionNumber: 22,
    section: 'Likert',
    questionText: 'I find it difficult to change my mind even when new evidence contradicts my beliefs.',
    questionType: 'Likert',
    maxScore: 5,
    isReverseScored: true,
    options: [
      { text: 'Strongly Disagree', value: 1 },
      { text: 'Disagree', value: 2 },
      { text: 'Neither Agree nor Disagree', value: 3 },
      { text: 'Agree', value: 4 },
      { text: 'Strongly Agree', value: 5 }
    ]
  },
  {
    questionNumber: 23,
    section: 'Likert',
    questionText: 'I enjoy exploring new ideas even if they are completely different from my usual way of thinking.',
    questionType: 'Likert',
    maxScore: 5,
    isReverseScored: false,
    options: [
      { text: 'Strongly Disagree', value: 1 },
      { text: 'Disagree', value: 2 },
      { text: 'Neither Agree nor Disagree', value: 3 },
      { text: 'Agree', value: 4 },
      { text: 'Strongly Agree', value: 5 }
    ]
  },
  {
    questionNumber: 24,
    section: 'Likert',
    questionText: 'I can quickly adapt to new concepts and theories.',
    questionType: 'Likert',
    maxScore: 5,
    isReverseScored: false,
    options: [
      { text: 'Strongly Disagree', value: 1 },
      { text: 'Disagree', value: 2 },
      { text: 'Neither Agree nor Disagree', value: 3 },
      { text: 'Agree', value: 4 },
      { text: 'Strongly Agree', value: 5 }
    ]
  },
  {
    questionNumber: 25,
    section: 'Likert',
    questionText: 'When facing a difficult problem, I look for different ways to view it.',
    questionType: 'Likert',
    maxScore: 5,
    isReverseScored: false,
    options: [
      { text: 'Strongly Disagree', value: 1 },
      { text: 'Disagree', value: 2 },
      { text: 'Neither Agree nor Disagree', value: 3 },
      { text: 'Agree', value: 4 },
      { text: 'Strongly Agree', value: 5 }
    ]
  },
  {
    questionNumber: 26,
    section: 'Likert',
    questionText: `When my first strategy for solving a problem doesn't work, I easily find alternative strategies.`,
    questionType: 'Likert',
    maxScore: 5,
    isReverseScored: false,
    options: [
      { text: 'Strongly Disagree', value: 1 },
      { text: 'Disagree', value: 2 },
      { text: 'Neither Agree nor Disagree', value: 3 },
      { text: 'Agree', value: 4 },
      { text: 'Strongly Agree', value: 5 }
    ]
  },
  {
    questionNumber: 27,
    section: 'Likert',
    questionText: 'I tend to use the same approaches to solve problems even when they are not effective.',
    questionType: 'Likert',
    maxScore: 5,
    isReverseScored: true,
    options: [
      { text: 'Strongly Disagree', value: 1 },
      { text: 'Disagree', value: 2 },
      { text: 'Neither Agree nor Disagree', value: 3 },
      { text: 'Agree', value: 4 },
      { text: 'Strongly Agree', value: 5 }
    ]
  },
  {
    questionNumber: 28,
    section: 'Likert',
    questionText: 'I can quickly modify problem-solving plans when circumstances change.',
    questionType: 'Likert',
    maxScore: 5,
    isReverseScored: false,
    options: [
      { text: 'Strongly Disagree', value: 1 },
      { text: 'Disagree', value: 2 },
      { text: 'Neither Agree nor Disagree', value: 3 },
      { text: 'Agree', value: 4 },
      { text: 'Strongly Agree', value: 5 }
    ]
  },
  {
    questionNumber: 29,
    section: 'Likert',
    questionText: 'I enjoy challenges that require creative thinking and unconventional solutions.',
    questionType: 'Likert',
    maxScore: 5,
    isReverseScored: false,
    options: [
      { text: 'Strongly Disagree', value: 1 },
      { text: 'Disagree', value: 2 },
      { text: 'Neither Agree nor Disagree', value: 3 },
      { text: 'Agree', value: 4 },
      { text: 'Strongly Agree', value: 5 }
    ]
  },
  {
    questionNumber: 30,
    section: 'Likert',
    questionText: 'I can apply knowledge from one domain to solve problems in a completely different domain.',
    questionType: 'Likert',
    maxScore: 5,
    isReverseScored: false,
    options: [
      { text: 'Strongly Disagree', value: 1 },
      { text: 'Disagree', value: 2 },
      { text: 'Neither Agree nor Disagree', value: 3 },
      { text: 'Agree', value: 4 },
      { text: 'Strongly Agree', value: 5 }
    ]
  },
  {
    questionNumber: 31,
    section: 'Likert',
    questionText: 'I can maintain my composure when facing unexpected changes.',
    questionType: 'Likert',
    maxScore: 5,
    isReverseScored: false,
    options: [
      { text: 'Strongly Disagree', value: 1 },
      { text: 'Disagree', value: 2 },
      { text: 'Neither Agree nor Disagree', value: 3 },
      { text: 'Agree', value: 4 },
      { text: 'Strongly Agree', value: 5 }
    ]
  },
  {
    questionNumber: 32,
    section: 'Likert',
    questionText: 'I feel highly anxious when my plans change at the last minute.',
    questionType: 'Likert',
    maxScore: 5,
    isReverseScored: true,
    options: [
      { text: 'Strongly Disagree', value: 1 },
      { text: 'Disagree', value: 2 },
      { text: 'Neither Agree nor Disagree', value: 3 },
      { text: 'Agree', value: 4 },
      { text: 'Strongly Agree', value: 5 }
    ]
  },
  {
    questionNumber: 33,
    section: 'Likert',
    questionText: 'I can handle disappointments and frustrations without them affecting my performance.',
    questionType: 'Likert',
    maxScore: 5,
    isReverseScored: false,
    options: [
      { text: 'Strongly Disagree', value: 1 },
      { text: 'Disagree', value: 2 },
      { text: 'Neither Agree nor Disagree', value: 3 },
      { text: 'Agree', value: 4 },
      { text: 'Strongly Agree', value: 5 }
    ]
  },
  {
    questionNumber: 34,
    section: 'Likert',
    questionText: 'I recover quickly from negative emotional situations.',
    questionType: 'Likert',
    maxScore: 5,
    isReverseScored: false,
    options: [
      { text: 'Strongly Disagree', value: 1 },
      { text: 'Disagree', value: 2 },
      { text: 'Neither Agree nor Disagree', value: 3 },
      { text: 'Agree', value: 4 },
      { text: 'Strongly Agree', value: 5 }
    ]
  },
  {
    questionNumber: 35,
    section: 'Likert',
    questionText: 'I can control my emotions even in stressful situations.',
    questionType: 'Likert',
    maxScore: 5,
    isReverseScored: false,
    options: [
      { text: 'Strongly Disagree', value: 1 },
      { text: 'Disagree', value: 2 },
      { text: 'Neither Agree nor Disagree', value: 3 },
      { text: 'Agree', value: 4 },
      { text: 'Strongly Agree', value: 5 }
    ]
  },
  {
    questionNumber: 36,
    section: 'Likert',
    questionText: 'I feel comfortable working in ambiguous situations where outcomes are unclear.',
    questionType: 'Likert',
    maxScore: 5,
    isReverseScored: false,
    options: [
      { text: 'Strongly Disagree', value: 1 },
      { text: 'Disagree', value: 2 },
      { text: 'Neither Agree nor Disagree', value: 3 },
      { text: 'Agree', value: 4 },
      { text: 'Strongly Agree', value: 5 }
    ]
  },
  {
    questionNumber: 37,
    section: 'Likert',
    questionText: 'I prefer following precisely defined plans rather than dealing with uncertain situations.',
    questionType: 'Likert',
    maxScore: 5,
    isReverseScored: true,
    options: [
      { text: 'Strongly Disagree', value: 1 },
      { text: 'Disagree', value: 2 },
      { text: 'Neither Agree nor Disagree', value: 3 },
      { text: 'Agree', value: 4 },
      { text: 'Strongly Agree', value: 5 }
    ]
  },
  {
    questionNumber: 38,
    section: 'Likert',
    questionText: 'I see unexpected changes as opportunities for growth and development.',
    questionType: 'Likert',
    maxScore: 5,
    isReverseScored: false,
    options: [
      { text: 'Strongly Disagree', value: 1 },
      { text: 'Disagree', value: 2 },
      { text: 'Neither Agree nor Disagree', value: 3 },
      { text: 'Agree', value: 4 },
      { text: 'Strongly Agree', value: 5 }
    ]
  },
  {
    questionNumber: 39,
    section: 'Likert',
    questionText: 'I can make good decisions even when available information is incomplete.',
    questionType: 'Likert',
    maxScore: 5,
    isReverseScored: false,
    options: [
      { text: 'Strongly Disagree', value: 1 },
      { text: 'Disagree', value: 2 },
      { text: 'Neither Agree nor Disagree', value: 3 },
      { text: 'Agree', value: 4 },
      { text: 'Strongly Agree', value: 5 }
    ]
  },
  {
    questionNumber: 40,
    section: 'Likert',
    questionText: `I feel tense when facing completely new situations I haven't experienced before.`,
    questionType: 'Likert',
    maxScore: 5,
    isReverseScored: true,
    options: [
      { text: 'Strongly Disagree', value: 1 },
      { text: 'Disagree', value: 2 },
      { text: 'Neither Agree nor Disagree', value: 3 },
      { text: 'Agree', value: 4 },
      { text: 'Strongly Agree', value: 5 }
    ]
  }
];

const populateQuestions = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      console.log('Attempting to connect to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edusoft', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      });
      console.log('Connected to MongoDB');
    } else {
      console.log('Already connected to MongoDB');
    }

    // Clear existing questions
    await AdaptabilityAssessmentQuestion.deleteMany({});
    console.log('Cleared existing adaptability assessment questions');

    // Insert new questions
    console.log('Attempting to insert questions:', questions.length);
    const result = await AdaptabilityAssessmentQuestion.insertMany(questions);
    console.log('Successfully populated adaptability assessment questions. Count:', result.length);

    // Verify questions were inserted
    const count = await AdaptabilityAssessmentQuestion.countDocuments();
    console.log('Total questions in database:', count);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error populating questions:', error);
    process.exit(1);
  }
};

populateQuestions(); 