import axios from 'axios';

// In a production environment, this would be loading from an API
// For development purposes, we'll use static data
// This could be expanded to fetch from the actual JSON file 

// Cache for assessment data
let assessmentDataCache = null;

/**
 * Service for handling CEFR language assessment data
 */
const CEFRService = {
  /**
   * Get assessment data for a specific level, language, and skill
   * @param {string} level - CEFR level (a1, a2, b1, b2, c1, c2)
   * @param {string} language - Language code (english, french, german, spanish)
   * @param {string} skill - Skill type (reading, writing, listening, speaking)
   * @returns {Promise<Object>} - Assessment data
   */
  async getAssessmentData(level, language, skill) {
    try {
      console.log(`Getting ${skill} assessment data for ${language} level ${level}`);
      
      // For speaking assessments, fetch from the database
      if (skill === 'speaking') {
        return this.getSpeakingAssessmentData(level, language);
      }

      // For writing assessment, use local tasks directly
      if (skill === 'writing') {
        console.log(`Using local ${skill} tasks`);
        const writingTasks = this.getTasksByLevelLanguageAndSkill(level, language, skill);
        
        if (!writingTasks || writingTasks.length === 0) {
          console.warn(`No writing tasks found for ${language} level ${level}, using fallback`);
        } else {
          console.log(`Found ${writingTasks.length} writing tasks for ${language} level ${level}`);
        }
        
        return {
          tasks: writingTasks
        };
      }
      
      // For listening assessment, use the real listening assessment data
      if (skill === 'listening') {
        console.log(`Getting real listening assessment data for ${level}`);
        const listeningData = this.getRealListeningAssessment(level);
        console.log(`Retrieved listening data with ${listeningData.questions?.length || 0} questions`);
        return listeningData;
      }
      
      // For other skills, attempt API but with fallback
      try {
        // Try to fetch from the API if available (not implemented in this version)
        // This is a placeholder for future implementation
        
        console.log(`Using local ${skill} tasks`);
        return {
          tasks: this.getTasksByLevelLanguageAndSkill(level, language, skill)
        };
      } catch (apiError) {
        console.warn(`API error fetching ${skill} assessment, using local data:`, apiError);
        // Fallback to local data
        return {
          tasks: this.getTasksByLevelLanguageAndSkill(level, language, skill)
        };
      }
    } catch (error) {
      console.error(`Error in getAssessmentData for ${skill}:`, error);
      // Always provide fallback data even if there's an error
      return {
        tasks: this.getTasksByLevelLanguageAndSkill(level, language, skill),
        error: error.message
      };
    }
  },

  /**
   * Get real listening assessment data from audio files and PDFs
   * @param {string} level - CEFR level (a1, a2, b1, b2, c1, c2)
   * @returns {Object} - Listening assessment data
   */
  getRealListeningAssessment(level) {
    // Define the questions based on the audio files and PDFs in the public directory
    const listeningAssessments = {
      'a1': {
        questions: [
          {
            id: 1,
            audioUrl: `/Listening/A1/A Voice Message/LE_listening_A1_A_voicemail_message.mp3`,
            question: "John works at Old Time Toys.",
            options: ["Yes", "No"],
            correctAnswer: 1,
            duration: 60 // seconds the audio plays
          },
          {
            id: 2,
            audioUrl: `/Listening/A1/A Voice Message/LE_listening_A1_A_voicemail_message.mp3`,
            question: "Marina wants...",
            options: ["product information, a brochure and prices.", "to call John again later."],
            correctAnswer: 0,
            duration: 60
          },
          {
            id: 3,
            audioUrl: `/Listening/A1/A Voice Message/LE_listening_A1_A_voicemail_message.mp3`,
            question: "Marina's number is...",
            options: ["0208 6557621", "0208 6656721"],
            correctAnswer: 0,
            duration: 60
          },
          {
            id: 4,
            audioUrl: `/Listening/A1/A Voice Message/LE_listening_A1_A_voicemail_message.mp3`,
            question: "Marina's email address is...",
            options: ["marina.silva@oldtime_toys.com", "marina.silva@oldtime-toys.com"],
            correctAnswer: 1,
            duration: 60
          }
        ]
      },
      'a2': {
        questions: [
          {
            id: 1,
            audioUrl: `/Listening/A2/Briefing/LE_listening_A2_Briefing.mp3`,
            question: "The briefing will be short this morning.",
            options: ["True", "False"],
            correctAnswer: 0,
            duration: 120
          },
          {
            id: 2,
            audioUrl: `/Listening/A2/Briefing/LE_listening_A2_Briefing.mp3`,
            question: "The new head of department is starting this week.",
            options: ["True", "False"],
            correctAnswer: 1,
            duration: 120
          },
          {
            id: 3,
            audioUrl: `/Listening/A2/Briefing/LE_listening_A2_Briefing.mp3`,
            question: "The car park will be closed for improvements.",
            options: ["True", "False"],
            correctAnswer: 0,
            duration: 120
          },
          {
            id: 4,
            audioUrl: `/Listening/A2/Briefing/LE_listening_A2_Briefing.mp3`,
            question: "If you arrive first thing in the morning, you should park on Brown Street.",
            options: ["True", "False"],
            correctAnswer: 0,
            duration: 120
          },
          {
            id: 5,
            audioUrl: `/Listening/A2/Briefing/LE_listening_A2_Briefing.mp3`,
            question: "There will be no parking in the church car park after 6 p.m.",
            options: ["True", "False"],
            correctAnswer: 0,
            duration: 120
          },
          {
            id: 6,
            audioUrl: `/Listening/A2/Briefing/LE_listening_A2_Briefing.mp3`,
            question: "You can only pay with credit and debit cards in the canteen.",
            options: ["True", "False"],
            correctAnswer: 1,
            duration: 120
          }
        ],
        classificationTask: {
          title: "Task 2",
          instructions: "Write the words in the correct group.",
          items: [
            { id: 1, text: "Firstly, there will be …" },
            { id: 2, text: "I have two more quick points." },
            { id: 3, text: "If you arrive before 8.30 a.m., please use …" },
            { id: 4, text: "If you arrive after that you should go directly to …" },
            { id: 5, text: "The other thing I want to tell you about is …" },
            { id: 6, text: "You have to leave before 6 p.m." }
          ],
          categories: [
            { id: "info", name: "Giving information", correctItems: [1, 2, 5] },
            { id: "instr", name: "Giving instructions", correctItems: [3, 4, 6] }
          ]
        },
        transcript: `Hi, everyone. I know you're all busy so I'll keep this briefing quick. I have some important
information about a change in the management team. As you already know, our head of
department, James Watson, is leaving his position at the end of this week. His replacement is
starting at the end of the next month. In the meantime, we'll continue with our projects as
usual.
I have two more quick points. Firstly, there will be some improvements made to the staff car
park next month for a few weeks. It will be closed during that time.
Don't worry, we've found a solution. We can use the local church car park until our own one is
ready. If you arrive before 8.30 a.m., please use our small car park on Brown Street, and if you
arrive after that, you should go directly to the church car park. It's only a five-minute walk
away. But they need it in the evenings, so you have to leave before 6 p.m. Sorry about that – I
know how much you all love working late!
The other thing I wanted to tell you about is that the canteen has now introduced a cashless
payment system. So, you can't use cash for payments any more. You can pay directly with
your smartphone or you can pay using your company ID card. The total amount put on your
company ID card comes off your salary at the end of each month.
OK. That's it? Are there any questions?`
      },
      'b1': {
        questions: [
          {
            id: 1,
            audioUrl: `/Listening/B1/LE_listening_B1_Student_discussion.mp3`,
            question: "What are the students mainly discussing?",
            options: ["Similarities and differences between Mars and Earth", "The possibility of living on Mars", "The history of Mars exploration", "The solar system"],
            correctAnswer: 0,
            duration: 180
          },
          {
            id: 2,
            audioUrl: `/Listening/B1/LE_listening_B1_Student_discussion.mp3`,
            question: "What is the length of a day on Mars compared to Earth?",
            options: ["Much shorter", "Slightly shorter", "About the same", "Slightly longer"],
            correctAnswer: 3,
            duration: 180
          },
          {
            id: 3,
            audioUrl: `/Listening/B1/LE_listening_B1_Student_discussion.mp3`,
            question: "What do the students say about water on Mars?",
            options: ["There is no water on Mars", "There is more water than on Earth", "Most of the water is probably frozen", "Water is only found at the poles"],
            correctAnswer: 2,
            duration: 180
          },
          {
            id: 4,
            audioUrl: `/Listening/B1/LE_listening_B1_Student_discussion.mp3`,
            question: "What proportion of Earth's gravity does Mars have?",
            options: ["About 18%", "About 38%", "About 50%", "About 78%"],
            correctAnswer: 1,
            duration: 180
          },
          {
            id: 5,
            audioUrl: `/Listening/B1/LE_listening_B1_Student_discussion.mp3`,
            question: "How do the students compare the distance of Earth and Mars from the Sun?",
            options: ["They are very similar", "Mars is slightly closer", "Mars is much further", "The difference is significant in astronomical units"],
            correctAnswer: 2,
            duration: 180
          }
        ],
        categorization: {
          title: "Task 1",
          instructions: "Write the characteristics in the correct group.",
          items: [
            { id: 1, text: "Has more air" },
            { id: 2, text: "Is closer to the Sun" },
            { id: 3, text: "Is colder" },
            { id: 4, text: "Has stronger gravity" },
            { id: 5, text: "Is 50 per cent smaller" },
            { id: 6, text: "Has more nitrogen and oxygen than carbon dioxide" },
            { id: 7, text: "Used to have water" },
            { id: 8, text: "Has a longer day" }
          ],
          categories: [
            { id: "earth", name: "Earth", correctItems: [1, 2, 4, 6] },
            { id: "mars", name: "Mars", correctItems: [3, 5, 7, 8] }
          ]
        },
        fillBlanks: {
          title: "Task 2",
          instructions: "Complete the sentences with words from the box.",
          options: [
            "astronomical",
            "nitrogen",
            "frozen",
            "support",
            "Gravity",
            "same"
          ],
          sentences: [
            {
              id: 1,
              text: "Most people think Mars can ________ human life.",
              answer: "support"
            },
            {
              id: 2,
              text: "We measure distances in space using ________ units.",
              answer: "astronomical"
            },
            {
              id: 3,
              text: "The two planets aren't the ________ colour.",
              answer: "same"
            },
            {
              id: 4,
              text: "Most of the water on Mars is probably ________ .",
              answer: "frozen"
            },
            {
              id: 5,
              text: "The air on Earth is mostly made up of ________ .",
              answer: "nitrogen"
            },
            {
              id: 6,
              text: "________ on Mars is just over one third as strong as on Earth.",
              answer: "Gravity"
            }
          ]
        },
        transcript: `Teacher: So you've got a few minutes to discuss with your partner.
Student 1: So, as far as I know, the main similarity between Mars and Earth is that they can
both support human life.
Student 2: Yeah, but do we know that's actually true? I mean, Mars is much colder than Earth,
isn't it? It says here it's about minus 55 degrees most of the time, whereas on Earth only
places like Antarctica get that cold.
Student 1: True. Well then, I suppose you could say both planets are a similar distance from
the Sun?
Student 2: No way! Mars is much further away! It says here it's about 228 million kilometres,
while Earth is about 150 million.
Student 1: Yes, but in space that's not that far. Jupiter is, like, almost 780 million kilometres.
That's why we use astronomical units when we talk about distances in space. Earth is 1
astronomical unit from the Sun and Mars is 1.3. The difference doesn't sound so big when you
look at it that way.
Student 2: I see what you mean. Jupiter is 5.2 astronomical units so I guess you're right. What
other similarities are there between the two planets?
Student 1: Let's see … not the colour, obviously!
Student 2: Yeah! Earth is called the blue planet and Mars is called the red planet for pretty
obvious reasons!
Student 1: Their sizes are pretty different. Mars is about half the size of Earth.
Student 2: What about this? It looks like the days on both planets are almost the same length.
Earth's day is 24 hours but Mars's is about half an hour longer.
Student 1: You're right. OK, any other things they both share?
Student 2: I suppose you could say they have water in common.
Student 1: Could you? How?
Student 2: Well, Earth is 70 per cent water and Mars probably had huge oceans in the past.
It's just that most of the water there now is probably frozen.
Student 1: Ah, I see. I don't think we can say the air is the same, though. Most of Earth's air is
nitrogen and oxygen, but Mars …?
Student 2: Mars doesn't really have air, not compared with Earth. It's got about one per
cent as much air as Earth.
Student 1: Right, and it's mostly carbon dioxide.
Student 2: Gravity is another difference. I didn't know this, but Mars has higher gravity than
the Moon. But it's much less than on Earth, of course.
Student 1: Oh, yes. It says Mars has about 38 per cent of Earth's gravity.
Teacher: OK, let's see what you've found …`
      },
      'b2': {
        questions: [
          {
            id: 1,
            audioUrl: `/Listening/B2/Design Presntaion/LE_listening_B2_A_design_presentation.mp3`,
            question: "_hidden_question_",
            options: ["_option_1_", "_option_2_"],
            correctAnswer: 0,
            duration: 120
          }
        ],
        audioUrl: `/Listening/B2/Design Presntaion/LE_listening_B2_A_design_presentation.mp3`,
        trueFalseTask: {
          title: "Task 1",
          instructions: "Are the sentences true or false?",
          items: [
            { 
              id: 1, 
              text: "They have redesigned an old product.", 
              answer: true 
            },
            { 
              id: 2, 
              text: "The product is aimed at men and women aged 18–40.", 
              answer: false 
            },
            { 
              id: 3, 
              text: "The new design means you don't need two hands to use it.", 
              answer: true 
            },
            { 
              id: 4, 
              text: "There's only one size now. Another one will follow in a few months.", 
              answer: false 
            },
            { 
              id: 5, 
              text: "They will make a Gantt chart for the project next month.", 
              answer: false 
            },
            { 
              id: 6, 
              text: "He finished the presentation with enough time to take some questions.", 
              answer: true 
            }
          ]
        },
        phraseMatchingTask: {
          title: "Task 2",
          instructions: "Write the useful phrases next to the tips.",
          phrases: [
            "I'd like to talk you through the following (three) points.",
            "As you can see … / You'll notice that …",
            "As you know, …",
            "I'd now like to tell you about …",
            "In summary, …",
            "Do you have any questions?",
            "Firstly, … / Next, …",
            "Finally, I'm going to talk to you about …"
          ],
          items: [
            {
              id: 1,
              text: "Refer to the audience's knowledge",
              answer: "As you know, …"
            },
            {
              id: 2,
              text: "Refer to what images you are showing",
              answer: "As you can see … / You'll notice that …"
            },
            {
              id: 3,
              text: "Tell them the structure of your presentation",
              answer: "I'd like to talk you through the following (three) points."
            },
            {
              id: 4,
              text: "Use signal words to help them follow you",
              answer: "Firstly, … / Next, …"
            },
            {
              id: 5,
              text: "Tell them when you're moving on",
              answer: "I'd now like to tell you about …"
            },
            {
              id: 6,
              text: "Show them when you're near the end",
              answer: "Finally, I'm going to talk to you about …"
            },
            {
              id: 7,
              text: "Tell them the main points one last time",
              answer: "In summary, …"
            },
            {
              id: 8,
              text: "Open up the discussion",
              answer: "Do you have any questions?"
            }
          ]
        },
        transcript: `Hi, everyone. Thanks for coming to this short presentation on our new product design. As you
know, we've already redeveloped our 'Adventure' shampoo to make it more modern and
appealing. And we've renamed it 'Adventure Tech'. Our market research established the target
market as men in the 18–40 age range who like to be outdoors and also like technical
gadgets, such as smartwatches, drones and things like that. We needed to create a bottle
which appeals to that market.
So, today, I'm happy to unveil our new bottle design. As you can see, it's designed to look like
a black metal drinking flask, with some digital features printed on it.
I'd like to talk you through the following three points: the key features, sizing and our timeline
for production.
Firstly, you'll notice it has an ergonomic design. That means it fits smoothly into your hand and
can be easily opened and squeezed using one hand. And, it looks like a flask you might use
when hiking outdoors. The imitation digital displays are designed to remind the user of other
tech devices they may have, such as a smartwatch or smart displays in their home.
I'd now like to tell you about the sizes. It comes in two sizes: the regular size and a small travel
size. The travel size is the same type of design – a flask, also with imitation digital displays on
the bottle. We were thinking of starting with one and following with the travel-size in a few
months, but we've worked hard and both are ready now.
Finally, I'm going to talk to you about our timeline for production. You've probably heard that
we're launching in two months. In preparation for that, we're starting the marketing campaign
next month. You can see the complete overview of all phases in this Gantt chart.
In summary, the bottle's been designed for men who like adventure and technology, and it
comes in two sizes. The marketing campaign is starting next month and we're launching the
product in two months.
OK. So, any questions? Feel free to also email me for further information in case we run out of
time.`
      },
      'c1': {
        questions: [
          {
            id: 1,
            audioUrl: `/Listening/C1/LE_listening_C1_Lecture.mp3`,
            question: "What is the main argument presented in the lecture?",
            options: ["Economic theory", "Social psychology", "Political science", "Environmental policy"],
            correctAnswer: 3,
            duration: 150
          }
        ]
      }
    };

    console.log(`Loading listening assessment for level: ${level}`);
    const assessment = listeningAssessments[level.toLowerCase()] || listeningAssessments['b1']; // Default to B1 if level not found
    console.log("Assessment data:", JSON.stringify(assessment, null, 2));
    return assessment;
  },

  /**
   * Fetch all assessment data (would be replaced with actual API call)
   * @returns {Promise<Object>} - Full assessment data
   */
  async fetchAllAssessmentData() {
    try {
      // In production, this would be an API call like:
      // return await axios.get('/api/cefr/assessment-data');
      
      // For development, we're using predefined data
      return this.getMockAssessmentData();
    } catch (error) {
      console.error('Error fetching assessment data:', error);
      throw error;
    }
  },

  /**
   * Filter assessment data based on level, language, and skill
   * @param {Object} data - Full assessment data
   * @param {string} level - CEFR level
   * @param {string} language - Language code
   * @param {string} skill - Skill type
   * @returns {Object} - Filtered assessment data
   */
  filterAssessmentData(data, level, language, skill) {
    if (!data || !data[skill] || !data[skill][level]) {
      return null;
    }
    
    // Apply language filtering if the data structure supports it
    let filteredData = data[skill][level];
    
    // If there's language-specific content, filter by language
    if (filteredData.languages && filteredData.languages[language]) {
      filteredData = {
        ...filteredData,
        content: filteredData.languages[language]
      };
    }
    
    return filteredData;
  },

  /**
   * Get mock assessment data (would be replaced with actual API data)
   * @returns {Object} - Mock assessment data structure
   */
  getMockAssessmentData() {
    // This is a simplified version of the full data structure
    // In a real implementation, this would come from the actual JSON file
    return {
      reading: {
        a1: {
          questions: [
            {
              id: 1,
              text: "Read the following short text: \"Hello, my name is John. I am 30 years old. I live in New York. I am a teacher.\"",
              question: "What is John's job?",
              options: ["He is a doctor", "He is a teacher", "He is a student", "He is an engineer"],
              correctAnswer: 1
            },
            {
              id: 2,
              text: "Look at the sign: \"NO SMOKING\"",
              question: "What does the sign mean?",
              options: ["You can smoke here", "You cannot smoke here", "You must smoke here", "You should smoke here"],
              correctAnswer: 1
            },
            {
              id: 3,
              text: "Read the text message: \"Hi Sarah, let's meet at the café at 5pm. See you later! - Mike\"",
              question: "When does Mike want to meet?",
              options: ["At 3pm", "At 4pm", "At 5pm", "At 6pm"],
              correctAnswer: 2
            }
          ],
          timeLimit: 10 * 60, // 10 minutes
          passingScore: 60
        },
        b1: {
          questions: [
            {
              id: 1,
              text: "Social media has transformed how we communicate. While it allows people to connect instantly across the globe, some critics argue that these digital connections are less meaningful than face-to-face interactions. Studies show that excessive social media use may contribute to feelings of isolation despite the appearance of connectivity.",
              question: "What do critics suggest about social media connections?",
              options: ["They are too expensive to maintain", "They are less meaningful than in-person interactions", "They are too difficult to establish", "They are only suitable for young people"],
              correctAnswer: 1
            },
            {
              id: 2,
              text: "Climate change is one of the most pressing issues of our time. Rising global temperatures have led to more extreme weather events, including hurricanes, droughts, and floods. Many countries are now implementing policies to reduce carbon emissions, though experts debate whether these measures are sufficient to address the scale of the problem.",
              question: "What phenomenon is linked to extreme weather events according to the text?",
              options: ["Economic growth", "Industrial development", "Rising global temperatures", "Government policies"],
              correctAnswer: 2
            },
            {
              id: 3,
              text: "A recent survey of work habits found that employees who work from home report higher levels of job satisfaction but may experience difficulties separating work life from personal life. The study suggests that a hybrid model, combining some remote work with office time, may offer the best balance for many workers.",
              question: "What challenge do remote workers face according to the text?",
              options: ["Lower productivity", "Difficulty separating work and personal life", "Poor job satisfaction", "Insufficient technology"],
              correctAnswer: 1
            }
          ],
          timeLimit: 20 * 60, // 20 minutes
          passingScore: 70
        },
        c1: {
          questions: [
            {
              id: 1,
              text: "The proliferation of artificial intelligence technologies has sparked vigorous debate among ethicists, technologists, and policymakers. While proponents highlight AI's potential to revolutionize healthcare, transportation, and other sectors, critics caution about unintended consequences, including algorithmic bias, privacy concerns, and potential job displacement. A nuanced regulatory framework that balances innovation with ethical considerations remains elusive but increasingly necessary as these technologies become more sophisticated and ubiquitous in daily life.",
              question: "What does the text suggest is both difficult to achieve and increasingly important?",
              options: ["Developing faster AI algorithms", "Creating more AI applications", "Balancing innovation with ethical regulations", "Completely preventing job displacement"],
              correctAnswer: 2
            },
            {
              id: 2,
              text: "Contemporary literary criticism has evolved substantially since its formalist origins. Post-structuralist approaches challenge the notion of fixed textual meaning, while postcolonial critics examine literature through the lens of imperial power dynamics. Feminist literary theory interrogates gender representations, and digital humanities now employs computational methods to analyze vast textual corpora. These diverse methodologies reflect the field's adaptation to changing intellectual paradigms and cultural contexts, demonstrating the dynamic nature of how we interpret written works.",
              question: "According to the text, what do the diverse methodologies in literary criticism demonstrate?",
              options: ["The superiority of newer approaches", "The field's adaptation to changing contexts", "The decline of traditional analysis", "The need for standardized methods"],
              correctAnswer: 1
            },
            {
              id: 3,
              text: "The microbiome comprises trillions of microorganisms residing within the human body that significantly influence physiological processes. Recent research has established correlations between gut microbial composition and various health conditions, including inflammatory disorders, metabolic syndromes, and even neurological states. This emerging understanding suggests potential therapeutic interventions targeting the microbiome, although translating laboratory findings to clinical applications presents considerable challenges due to the microbiome's complexity and high individual variability.",
              question: "What major challenge exists in developing microbiome-based treatments according to the text?",
              options: ["Insufficient research funding", "Microbiome complexity and individual variability", "Lack of interest from pharmaceutical companies", "Regulatory obstacles"],
              correctAnswer: 1
            }
          ],
          timeLimit: 30 * 60, // 30 minutes
          passingScore: 75
        }
      },
      listening: {
        a1: {
          questions: [
            {
              id: 1,
              audioDescription: "A simple dialogue: \"Hello, how are you?\" \"I'm fine, thank you. And you?\" \"I'm good, thanks.\"",
              question: "How is the first person feeling?",
              options: ["Sad", "Angry", "Good", "Tired"],
              correctAnswer: 2,
              duration: 5
            },
            {
              id: 2,
              audioDescription: "Announcement: \"The train to London departs from platform 5 at 3:30 PM.\"",
              question: "What time does the train depart?",
              options: ["2:30 PM", "3:00 PM", "3:30 PM", "5:30 PM"],
              correctAnswer: 2,
              duration: 5
            },
            {
              id: 3,
              audioDescription: "Dialogue at a restaurant: \"I'd like a coffee, please.\" \"Small or large?\" \"Large, please.\" \"That's $3.50.\"",
              question: "What size coffee does the person order?",
              options: ["Small", "Medium", "Large", "Extra large"],
              correctAnswer: 2,
              duration: 8
            }
          ],
          timeLimit: 15 * 60
        },
        b1: {
          questions: [
            {
              id: 1,
              audioDescription: "News report: \"The government announced today a new initiative to reduce plastic waste in oceans. The plan includes a ban on single-use plastics starting next year and incentives for companies developing eco-friendly alternatives.\"",
              question: "What will be banned according to the news report?",
              options: ["All plastic products", "Single-use plastics", "Ocean fishing", "Eco-friendly alternatives"],
              correctAnswer: 1,
              duration: 15
            },
            {
              id: 2,
              audioDescription: "Interview: \"I've been working as a software developer for about five years now. The industry has changed dramatically during that time. When I started, mobile app development was just becoming mainstream, but now we're focusing on AI and machine learning applications.\"",
              question: "How long has the speaker been working as a software developer?",
              options: ["About two years", "About five years", "About ten years", "More than ten years"],
              correctAnswer: 1,
              duration: 15
            },
            {
              id: 3,
              audioDescription: "Podcast discussion: \"While traditional education still has its place, online learning has seen tremendous growth in recent years. The flexibility it offers allows people to study at their own pace and fit education around their existing commitments. However, critics argue that the lack of direct interaction with teachers and peers can affect the quality of education.\"",
              question: "What advantage of online learning is mentioned?",
              options: ["Lower cost", "Better quality", "Flexibility", "More social interaction"],
              correctAnswer: 2,
              duration: 20
            }
          ],
          timeLimit: 25 * 60
        },
        c1: {
          questions: [
            {
              id: 1,
              audioDescription: "Academic lecture: \"The concept of neuroplasticity has fundamentally altered our understanding of brain development. Contrary to earlier beliefs that neural pathways become fixed in early childhood, contemporary research demonstrates that the brain maintains remarkable adaptability throughout life. This plasticity enables cognitive restructuring in response to environmental stimuli, traumatic events, or deliberate practice, though the rate and extent of adaptation diminishes with age.\"",
              question: "What earlier belief about neural pathways does the lecture contradict?",
              options: ["They could be easily changed at any age", "They become fixed in early childhood", "They only develop during adolescence", "They remain completely unchanged throughout life"],
              correctAnswer: 1,
              duration: 30
            },
            {
              id: 2,
              audioDescription: "Economic analysis: \"The phenomenon of quantitative easing, implemented by central banks following the 2008 financial crisis, represents an unconventional monetary policy designed to stimulate economic activity. By purchasing long-term securities from the open market, central banks increase the money supply and encourage lending and investment. Critics argue that such policies may lead to asset bubbles, currency devaluation, and increased wealth inequality, while proponents emphasize their role in preventing deflationary spirals during economic downturns.\"",
              question: "What criticism of quantitative easing is mentioned?",
              options: ["It reduces economic growth", "It creates too many jobs", "It may lead to asset bubbles", "It decreases the money supply"],
              correctAnswer: 2,
              duration: 30
            },
            {
              id: 3,
              audioDescription: "Literary podcast: \"Magical realism as exemplified in Gabriel García Márquez's 'One Hundred Years of Solitude' represents a narrative mode that seamlessly interweaves the mundane with the fantastical. Unlike pure fantasy, magical realism presents extraordinary elements within an otherwise realistic setting, often reflecting cultural contexts where the boundary between the mystical and the quotidian remains permeable.\"",
              question: "How does magical realism differ from pure fantasy according to the podcast?",
              options: ["It has more realistic characters", "It presents extraordinary elements within a realistic setting", "It was developed more recently", "It focuses exclusively on political themes"],
              correctAnswer: 1,
              duration: 25
            }
          ],
          timeLimit: 35 * 60
        }
      },
      // You would have similar structures for writing and speaking
      writing: {
        a1: {
          tasks: [
            {
              id: 1,
              title: "Personal Introduction",
              prompt: "Write 3-5 simple sentences about yourself. Include your name, age, country, job/studies, and one thing you like.",
              wordLimit: 40,
              timeLimit: 10 * 60,
              criteria: ["Basic vocabulary", "Simple sentence structure", "Personal information"]
            },
            {
              id: 2,
              title: "Daily Routine",
              prompt: "Write 3-5 simple sentences about your daily routine. What do you do in the morning, afternoon, and evening?",
              wordLimit: 50,
              timeLimit: 10 * 60,
              criteria: ["Time expressions", "Present tense", "Basic vocabulary"]
            }
          ]
        },
        b1: {
          tasks: [
            {
              id: 1,
              title: "Travel Experience",
              prompt: "Write a short text about a trip or vacation you enjoyed. Where did you go? Who did you go with? What did you do? Why was it memorable?",
              wordLimit: 120,
              timeLimit: 20 * 60,
              criteria: ["Past tense narration", "Descriptive language", "Logical sequence", "Personal reflection"]
            },
            {
              id: 2,
              title: "Formal Email",
              prompt: "Write an email to apply for a part-time job at a local café. Explain your availability, previous experience, and why you would be a good fit for the position.",
              wordLimit: 150,
              timeLimit: 20 * 60,
              criteria: ["Formal register", "Clear structure", "Relevant content", "Appropriate format"]
            }
          ]
        },
        c1: {
          tasks: [
            {
              id: 1,
              title: "Argumentative Essay",
              prompt: "Write an essay discussing whether social media has had a positive or negative impact on society. Present arguments for both sides and state your own opinion with supporting reasons.",
              wordLimit: 300,
              timeLimit: 40 * 60,
              criteria: ["Advanced vocabulary", "Complex sentence structures", "Cohesive arguments", "Critical thinking", "Academic register"]
            },
            {
              id: 2,
              title: "Report Analysis",
              prompt: "Analyze the trend of remote work and its effects on productivity and work-life balance. Use the concept of a formal report with introduction, findings, and recommendations.",
              wordLimit: 350,
              timeLimit: 40 * 60,
              criteria: ["Data interpretation", "Formal register", "Analytical thinking", "Logical structure", "Recommendations"]
            }
          ]
        }
      },
      speaking: {
        a1: {
          tasks: [
            {
              id: 1,
              title: "Self Introduction",
              prompt: "Introduce yourself. Talk about your name, age, where you live, your job or studies, and your hobbies.",
              preparationTime: 30,
              speakingTime: 60,
              criteria: ["Basic vocabulary", "Pronunciation", "Fluency"]
            },
            {
              id: 2,
              title: "Describing a Picture",
              prompt: "Look at the picture of a family having a meal. Describe what you see in the picture. Who is there? What are they doing? Where are they?",
              preparationTime: 30,
              speakingTime: 60,
              criteria: ["Descriptive language", "Present continuous", "Coherence"]
            }
          ]
        },
        b1: {
          tasks: [
            {
              id: 1,
              title: "Past Experience",
              prompt: "Talk about a memorable trip or vacation you have taken. Where did you go? Who were you with? What did you do? Why was it memorable?",
              preparationTime: 60,
              speakingTime: 120,
              criteria: ["Past tense narration", "Descriptive language", "Fluency", "Pronunciation"]
            },
            {
              id: 2,
              title: "Expressing an Opinion",
              prompt: "Do you think technology has made our lives better or worse? Give reasons for your opinion.",
              preparationTime: 60,
              speakingTime: 120,
              criteria: ["Opinion vocabulary", "Argumentation", "Clarity", "Cohesion"]
            }
          ]
        },
        c1: {
          tasks: [
            {
              id: 1,
              title: "Complex Topic Discussion",
              prompt: "Discuss the challenges of balancing technological progress with environmental sustainability. What are the key issues? What solutions might be effective?",
              preparationTime: 90,
              speakingTime: 180,
              criteria: ["Advanced vocabulary", "Complex structures", "Critical analysis", "Fluency", "Pronunciation"]
            },
            {
              id: 2,
              title: "Hypothetical Situation",
              prompt: "If you could change one aspect of your country's education system, what would it be and why? Explain the current issues and how your changes would improve the situation.",
              preparationTime: 90,
              speakingTime: 180,
              criteria: ["Hypothetical expressions", "Nuanced argument", "Structured discourse", "Persuasive language"]
            }
          ]
        }
      }
    };
  },

  /**
   * Calculate CEFR results based on score and target level
   * @param {number} percentage - Score percentage
   * @param {string} targetLevel - Target CEFR level
   * @returns {Object} - CEFR results with achieved level and recommendation
   */
  calculateCEFRResult(percentage, targetLevel) {
    // Determine if the user passed the test for their target level
    // or should be placed at a different level
    if (percentage >= 80) {
      // Passed with high score - may be ready for next level
      const levels = ['a1', 'a2', 'b1', 'b2', 'c1'];
      const currentIndex = levels.indexOf(targetLevel);
      if (currentIndex < levels.length - 1) {
        return {
          achieved: targetLevel,
          recommendation: levels[currentIndex + 1]
        };
      }
      return {
        achieved: targetLevel,
        recommendation: null // Already at highest level
      };
    } else if (percentage >= 60) {
      // Passed at target level
      return {
        achieved: targetLevel,
        recommendation: targetLevel
      };
    } else {
      // Did not pass - recommend a lower level
      const levels = ['a1', 'a2', 'b1', 'b2', 'c1'];
      const currentIndex = levels.indexOf(targetLevel);
      if (currentIndex > 0) {
        return {
          achieved: levels[currentIndex - 1],
          recommendation: levels[currentIndex - 1]
        };
      }
      return {
        achieved: 'pre-a1',
        recommendation: 'a1'
      };
    }
  },

  /**
   * Generate feedback based on score and level
   * @param {number} score - Score percentage
   * @param {string} level - CEFR level
   * @param {string} skill - Skill type
   * @returns {string} - Feedback message
   */
  generateFeedback(score, level, skill) {
    const skillMap = {
      reading: {
        high: 'excellent reading comprehension',
        medium: 'good reading skills',
        low: 'basic reading comprehension'
      },
      writing: {
        high: 'excellent writing skills',
        medium: 'good writing ability',
        low: 'basic writing skills'
      },
      listening: {
        high: 'excellent listening comprehension',
        medium: 'good listening skills',
        low: 'basic listening comprehension'
      },
      speaking: {
        high: 'excellent speaking skills',
        medium: 'good speaking ability',
        low: 'basic speaking skills'
      }
    };

    const skillFeedback = skillMap[skill] || skillMap.reading;

    if (score >= 80) {
      return `You demonstrate ${skillFeedback.high} at ${level.toUpperCase()} level. Your performance shows strong language proficiency appropriate for this level.`;
    } else if (score >= 60) {
      return `You show ${skillFeedback.medium} at ${level.toUpperCase()} level. You can understand and use language at this level with only minor difficulties.`;
    } else if (score >= 40) {
      return `You demonstrate ${skillFeedback.low} at ${level.toUpperCase()} level, but would benefit from more practice to improve consistency and accuracy.`;
    } else {
      return `This level appears challenging for you. Consider practicing with materials at a lower level before attempting ${level.toUpperCase()} level again.`;
    }
  },

  /**
   * Fetch speaking assessment tasks from the database
   * @param {string} level - CEFR level (a1, a2, b1, b2, c1, c2)
   * @param {string} language - Language (english, french, etc.)
   * @returns {Promise<Object>} Speaking assessment data
   */
  async getSpeakingAssessmentData(level, language) {
    try {
      // Fetch questions from the API
      const response = await axios.get(`/api/speaking-questions/${language}/${level}`);
      
      if (response.data.success && response.data.data) {
        // Transform database format to component format
        return {
          tasks: response.data.data.map(question => ({
            id: question.taskId,
            title: question.title,
            prompt: question.prompt,
            preparationTime: question.preparationTime,
            speakingTime: question.speakingTime,
            criteria: question.criteria
          }))
        };
      } else {
        console.error('Failed to fetch speaking questions:', response.data.message);
        throw new Error('Failed to fetch speaking questions');
      }
    } catch (error) {
      console.error('Error fetching speaking assessment data:', error);
      // Return fallback data or rethrow the error
      return {
        tasks: this.getTasksByLevelLanguageAndSkill(level, language, 'speaking')
      };
    }
  },

  /**
   * Get tasks based on level, language, and skill (fallback method)
   * @param {string} level - CEFR level
   * @param {string} language - Language
   * @param {string} skill - Skill type
   * @returns {Array} Array of tasks
   */
  getTasksByLevelLanguageAndSkill(level, language, skill) {
    console.log(`Getting fallback tasks for ${skill} - ${language} - ${level}`);
    
    // This is now a fallback method for when API calls fail
    if (skill === 'speaking') {
      const tasksByLevel = {
        'a1': [
          {
            id: 1,
            title: language === 'english' ? 'Self Introduction' : 'Présentation Personnelle',
            prompt: language === 'english' ? 
              'Introduce yourself. Talk about your name, age, where you live, your job or studies, and your hobbies.' : 
              'Présentez-vous. Parlez de votre nom, votre âge, où vous habitez, votre travail ou vos études, et vos loisirs.',
            preparationTime: 30,
            speakingTime: 60,
            criteria: [
              language === 'english' ? 'Basic Vocabulary' : 'Vocabulaire de Base', 
              language === 'english' ? 'Pronunciation' : 'Prononciation', 
              language === 'english' ? 'Fluency' : 'Aisance'
            ]
          }
        ],
        // ...other levels (removed for brevity but should remain as fallback)
      };
      
      // If level not found, default to A1 or closest available
      return tasksByLevel[level.toLowerCase()] || tasksByLevel['a1'];
    }
    
    // Handle writing skill specifically
    if (skill === 'writing') {
      const tasksByLevel = {
        'a1': [
          {
            id: 1,
            title: language === 'english' ? 'Simple Introduction' : 'Présentation Simple',
            prompt: language === 'english' ? 
              'Write a short paragraph about yourself (name, age, nationality, job/studies, hobbies).' : 
              'Écrivez un court paragraphe sur vous-même (nom, âge, nationalité, travail/études, loisirs).',
            timeLimit: 10 * 60, // 10 minutes
            wordLimit: 50,
            criteria: [
              language === 'english' ? 'Basic Vocabulary' : 'Vocabulaire de Base', 
              language === 'english' ? 'Simple Sentences' : 'Phrases Simples', 
              language === 'english' ? 'Personal Information' : 'Informations Personnelles'
            ]
          },
          {
            id: 2,
            title: language === 'english' ? 'Short Message' : 'Message Court',
            prompt: language === 'english' ? 
              'Write a short message to a friend inviting them to have coffee with you. Include the date, time, and place.' : 
              'Écrivez un court message à un ami pour l\'inviter à prendre un café avec vous. Incluez la date, l\'heure et le lieu.',
            timeLimit: 10 * 60,
            wordLimit: 40,
            criteria: [
              language === 'english' ? 'Basic Greetings' : 'Salutations de Base', 
              language === 'english' ? 'Time Expressions' : 'Expressions de Temps', 
              language === 'english' ? 'Simple Request' : 'Demande Simple'
            ]
          }
        ],
        'b1': [
          {
            id: 1,
            title: language === 'english' ? 'Personal Experience' : 'Expérience Personnelle',
            prompt: language === 'english' ? 
              'Write about a memorable trip or vacation you have taken. Describe where you went, who you were with, what you did, and why it was memorable.' : 
              'Écrivez à propos d\'un voyage ou de vacances mémorables que vous avez fait. Décrivez où vous êtes allé, avec qui vous étiez, ce que vous avez fait et pourquoi c\'était mémorable.',
            timeLimit: 20 * 60, // 20 minutes
            wordLimit: 150,
            criteria: [
              language === 'english' ? 'Past Tense Narration' : 'Narration au Passé', 
              language === 'english' ? 'Descriptive Language' : 'Langage Descriptif', 
              language === 'english' ? 'Logical Sequence' : 'Séquence Logique',
              language === 'english' ? 'Personal Reflection' : 'Réflexion Personnelle'
            ]
          },
          {
            id: 2,
            title: language === 'english' ? 'Formal Email' : 'Email Formel',
            prompt: language === 'english' ? 
              'Write an email to apply for a part-time job at a local café. Explain your availability, previous experience, and why you would be a good fit for the position.' : 
              'Écrivez un email pour postuler à un emploi à temps partiel dans un café local. Expliquez votre disponibilité, votre expérience précédente et pourquoi vous seriez un bon candidat pour le poste.',
            timeLimit: 20 * 60,
            wordLimit: 150,
            criteria: [
              language === 'english' ? 'Formal Register' : 'Registre Formel', 
              language === 'english' ? 'Clear Structure' : 'Structure Claire', 
              language === 'english' ? 'Relevant Content' : 'Contenu Pertinent',
              language === 'english' ? 'Polite Expressions' : 'Expressions Polies'
            ]
          }
        ],
        'c1': [
          {
            id: 1,
            title: language === 'english' ? 'Argumentative Essay' : 'Essai Argumentatif',
            prompt: language === 'english' ? 
              'Write an essay discussing whether social media has had a positive or negative impact on society. Present arguments for both sides and state your own opinion with supporting reasons.' : 
              'Rédigez un essai discutant si les médias sociaux ont eu un impact positif ou négatif sur la société. Présentez des arguments pour les deux côtés et donnez votre propre opinion avec des raisons à l\'appui.',
            timeLimit: 40 * 60, // 40 minutes
            wordLimit: 300,
            criteria: [
              language === 'english' ? 'Advanced Vocabulary' : 'Vocabulaire Avancé', 
              language === 'english' ? 'Complex Sentence Structures' : 'Structures de Phrases Complexes', 
              language === 'english' ? 'Cohesive Arguments' : 'Arguments Cohésifs',
              language === 'english' ? 'Critical Thinking' : 'Pensée Critique',
              language === 'english' ? 'Academic Register' : 'Registre Académique'
            ]
          },
          {
            id: 2,
            title: language === 'english' ? 'Book or Film Review' : 'Critique de Livre ou Film',
            prompt: language === 'english' ? 
              'Write a review of a book or film that has influenced you significantly. Analyze its themes, strengths and weaknesses, and explain why it had an impact on you. Your review should be detailed and nuancée.' : 
              'Écrivez une critique d\'un livre ou d\'un film qui vous a influencé de manière significative. Analysez ses thèmes, ses forces et ses faiblesses, et expliquez pourquoi il a eu un impact sur vous. Votre critique doit être détaillée et nuancée.',
            timeLimit: 40 * 60,
            wordLimit: 300,
            criteria: [
              language === 'english' ? 'Critical Analysis' : 'Analyse Critique', 
              language === 'english' ? 'Detailed Description' : 'Description Détaillée', 
              language === 'english' ? 'Personal Evaluation' : 'Évaluation Personnelle',
              language === 'english' ? 'Nuanced Expression' : 'Expression Nuancée',
              language === 'english' ? 'Cultural References' : 'Références Culturelles'
            ]
          }
        ]
      };
      
      // If level not found, default to A1 or closest available
      return tasksByLevel[level.toLowerCase()] || tasksByLevel['a1'];
    }
    
    // For listening skill (fallback)
    if (skill === 'listening') {
      // Return basic listening tasks
      const tasksByLevel = {
        'a1': [
          {
            id: 1,
            title: language === 'english' ? 'Basic Dialogue' : 'Dialogue Simple',
            audioDescription: language === 'english' ? 
              'A simple dialogue between two people meeting for the first time.' : 
              'Un dialogue simple entre deux personnes qui se rencontrent pour la première fois.',
            questions: [
              {
                id: 1,
                question: language === 'english' ? 'Where are the people?' : 'Où sont les personnes?',
                options: language === 'english' ? 
                  ['At a restaurant', 'At school', 'At a party', 'At work'] : 
                  ['Dans un restaurant', 'À l\'école', 'À une fête', 'Au travail'],
                correctAnswer: 2
              }
            ],
            duration: 60
          }
        ],
        'b1': [
          {
            id: 1,
            title: language === 'english' ? 'News Report' : 'Bulletin d\'information',
            audioDescription: language === 'english' ? 
              'A news report about recent weather events.' : 
              'Un bulletin d\'information sur des événements météorologiques récents.',
            questions: [
              {
                id: 1,
                question: language === 'english' ? 'What is the main topic?' : 'Quel est le sujet principal?',
                options: language === 'english' ? 
                  ['Weather forecast', 'Climate change', 'Recent storms', 'Government policy'] : 
                  ['Prévisions météo', 'Changement climatique', 'Tempêtes récentes', 'Politique gouvernementale'],
                correctAnswer: 2
              }
            ],
            duration: 120
          }
        ]
      };
      
      return tasksByLevel[level.toLowerCase()] || tasksByLevel['a1'];
    }
    
    // Handle reading skill or any other skills (fallback)
    return [];
  }
};

export default CEFRService; 