import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Assessment from '../src/models/Assessment.js';

dotenv.config();

const initAssessments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');
    
    // We'll use upsert instead of delete + insert to avoid issues
    console.log('Creating/updating assessments...');
    
    // Create default assessments
    const defaultAssessments = [
      {
        title: 'Presentation Skills Assessment',
        description: 'Evaluate your ability to effectively present ideas and information to an audience.',
        category: 'presentation',
        duration: 30,
        questions: [
          {
            questionNumber: 1,
            questionText: 'How comfortable are you when presenting to a large audience?',
            options: [
              { text: 'Very uncomfortable', score: 1 },
              { text: 'Somewhat uncomfortable', score: 2 },
              { text: 'Neutral', score: 3 },
              { text: 'Somewhat comfortable', score: 4 },
              { text: 'Very comfortable', score: 5 }
            ]
          },
          {
            questionNumber: 2,
            questionText: 'How well do you prepare for presentations?',
            options: [
              { text: 'I rarely prepare', score: 1 },
              { text: 'I do minimal preparation', score: 2 },
              { text: 'I prepare adequately', score: 3 },
              { text: 'I prepare thoroughly', score: 4 },
              { text: 'I prepare extensively and practice', score: 5 }
            ]
          },
          {
            questionNumber: 3,
            questionText: 'How effectively do you use visual aids in your presentations?',
            options: [
              { text: 'Not effective at all', score: 1 },
              { text: 'Slightly effective', score: 2 },
              { text: 'Moderately effective', score: 3 },
              { text: 'Very effective', score: 4 },
              { text: 'Extremely effective', score: 5 }
            ]
          }
        ]
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
            questionText: 'How well do you delegate tasks to team members?',
            options: [
              { text: 'I rarely delegate', score: 1 },
              { text: 'I sometimes delegate but not effectively', score: 2 },
              { text: 'I delegate adequately', score: 3 },
              { text: 'I delegate effectively most of the time', score: 4 },
              { text: 'I always delegate effectively', score: 5 }
            ]
          }
        ]
      },
      {
        title: 'Problem Solving Skills Assessment',
        description: 'Test your ability to analyze complex problems and develop effective solutions.',
        category: 'problem-solving',
        duration: 45,
        questions: [
          {
            questionNumber: 1,
            questionText: 'How do you approach complex problems?',
            options: [
              { text: 'I avoid them if possible', score: 1 },
              { text: 'I try to solve them but get frustrated easily', score: 2 },
              { text: 'I work through them methodically', score: 3 },
              { text: 'I enjoy the challenge and usually find solutions', score: 4 },
              { text: 'I excel at breaking down and solving complex problems', score: 5 }
            ]
          },
          {
            questionNumber: 2,
            questionText: 'How often do you consider multiple solutions before making a decision?',
            options: [
              { text: 'Rarely or never', score: 1 },
              { text: 'Occasionally', score: 2 },
              { text: 'Sometimes', score: 3 },
              { text: 'Often', score: 4 },
              { text: 'Always', score: 5 }
            ]
          },
          {
            questionNumber: 3,
            questionText: 'How well do you adapt when your initial solution doesn\'t work?',
            options: [
              { text: 'I give up easily', score: 1 },
              { text: 'I struggle to adapt', score: 2 },
              { text: 'I can usually find alternatives', score: 3 },
              { text: 'I adapt well to setbacks', score: 4 },
              { text: 'I thrive on finding new approaches', score: 5 }
            ]
          }
        ]
      },
      {
        title: 'Teamwork Skills Assessment',
        description: 'Evaluate your ability to work effectively in a team environment.',
        category: 'teamwork',
        duration: 25,
        questions: [
          {
            questionNumber: 1,
            questionText: 'How well do you collaborate with team members who have different opinions?',
            options: [
              { text: 'I avoid collaboration', score: 1 },
              { text: 'I struggle with different opinions', score: 2 },
              { text: 'I can work with different opinions', score: 3 },
              { text: 'I value different perspectives', score: 4 },
              { text: 'I actively seek diverse viewpoints', score: 5 }
            ]
          },
          {
            questionNumber: 2,
            questionText: 'How do you handle conflicts within a team?',
            options: [
              { text: 'I avoid conflicts at all costs', score: 1 },
              { text: 'I get defensive or aggressive', score: 2 },
              { text: 'I try to find middle ground', score: 3 },
              { text: 'I address conflicts constructively', score: 4 },
              { text: 'I see conflicts as opportunities for growth', score: 5 }
            ]
          },
          {
            questionNumber: 3,
            questionText: 'How reliable are you in completing your assigned tasks in a team?',
            options: [
              { text: 'Not reliable', score: 1 },
              { text: 'Somewhat reliable', score: 2 },
              { text: 'Usually reliable', score: 3 },
              { text: 'Very reliable', score: 4 },
              { text: 'Extremely reliable', score: 5 }
            ]
          }
        ]
      },
      {
        title: 'Adaptability & Flexibility Assessment',
        description: 'Assess your ability to adapt to change and handle unexpected situations.',
        category: 'adaptability',
        duration: 20,
        questions: [
          {
            questionNumber: 1,
            questionText: 'How do you respond to unexpected changes in plans or requirements?',
            options: [
              { text: 'I get very frustrated', score: 1 },
              { text: 'I struggle to adjust', score: 2 },
              { text: 'I can adjust with some effort', score: 3 },
              { text: 'I adjust fairly easily', score: 4 },
              { text: 'I embrace change as an opportunity', score: 5 }
            ]
          },
          {
            questionNumber: 2,
            questionText: 'How comfortable are you working in ambiguous situations?',
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
            questionText: 'How quickly do you learn new skills or technologies?',
            options: [
              { text: 'Very slowly', score: 1 },
              { text: 'Somewhat slowly', score: 2 },
              { text: 'At an average pace', score: 3 },
              { text: 'Fairly quickly', score: 4 },
              { text: 'Very quickly', score: 5 }
            ]
          }
        ]
      },
      {
        title: 'Communication Skills Assessment',
        description: 'Evaluate your verbal and written communication abilities.',
        category: 'communication',
        duration: 30,
        questions: [
          {
            questionNumber: 1,
            questionText: 'How clearly do you express your ideas when speaking?',
            options: [
              { text: 'Not clear at all', score: 1 },
              { text: 'Somewhat unclear', score: 2 },
              { text: 'Moderately clear', score: 3 },
              { text: 'Very clear', score: 4 },
              { text: 'Extremely clear and articulate', score: 5 }
            ]
          },
          {
            questionNumber: 2,
            questionText: 'How well do you listen to others?',
            options: [
              { text: 'I rarely listen attentively', score: 1 },
              { text: 'I sometimes get distracted', score: 2 },
              { text: 'I listen adequately', score: 3 },
              { text: 'I listen attentively most of the time', score: 4 },
              { text: 'I always listen actively and empathetically', score: 5 }
            ]
          },
          {
            questionNumber: 3,
            questionText: 'How effective are your written communications?',
            options: [
              { text: 'Not effective', score: 1 },
              { text: 'Somewhat effective', score: 2 },
              { text: 'Moderately effective', score: 3 },
              { text: 'Very effective', score: 4 },
              { text: 'Extremely effective', score: 5 }
            ]
          }
        ]
      }
    ];
    
    // Upsert each assessment individually
    for (const assessment of defaultAssessments) {
      await Assessment.findOneAndUpdate(
        { category: assessment.category },
        assessment,
        { upsert: true, new: true }
      );
      console.log(`Upserted assessment: ${assessment.title}`);
    }
    
    // Verify the assessments were created
    const assessments = await Assessment.find({});
    console.log(`
Total assessments in database: ${assessments.length}`);
    assessments.forEach(assessment => {
      console.log(`- ${assessment.title} (${assessment.category}) with ${assessment.questions?.length || 0} questions`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

initAssessments();
