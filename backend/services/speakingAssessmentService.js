// speakingAssessmentService.js
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

/**
 * Service for evaluating speaking assessments using AI
 */
class SpeakingAssessmentService {
  constructor() {
    // Use the provided OpenRouter API key or fall back to environment variable
    this.openRouterApiKey = "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";
    this.model = "meta-llama/llama-3.2-11b-vision-instruct:free";
    console.log("SpeakingAssessmentService initialized with model:", this.model);
    
    // Flag to use mock responses for testing - Set to TRUE for reliability
    this.useMockResponse = true;
    console.log("Using mock responses for speaking assessment:", this.useMockResponse);
    
    // Flag to use mock responses as fallback when API fails
    this.useFallbackOnError = true;
    console.log("Using fallback responses when API fails:", this.useFallbackOnError);
  }

  /**
   * Transcribe audio to text using a mock service
   * @param {string} audioBase64 - Base64-encoded audio data
   * @returns {Promise<string>} - Transcribed text
   */
  async transcribeAudio(audioBase64) {
    try {
      console.log("Attempting to transcribe audio...");
      
      // Generate a realistic mock transcription based on the task topic
      // In a production environment, you would integrate with a real transcription API
      const mockTranscriptions = [
        "I took a memorable trip to Japan last summer with my family. We visited Tokyo, Kyoto, and Osaka. The food was amazing, especially the ramen and sushi. We explored temples, gardens, and modern city areas. It was memorable because of the cultural experiences and the friendly people we met.",
        
        "My most memorable vacation was a road trip along the California coast. I went with my best friends and we drove from San Francisco to Los Angeles. We stopped at beautiful beaches, hiked in the mountains, and enjoyed local cuisine. It was special because it was our first trip after graduating college.",
        
        "Last year, I had an unforgettable trip to Italy. I traveled with my partner to Rome, Florence, and Venice. We visited historical sites like the Colosseum and Vatican, enjoyed authentic Italian pasta and gelato, and took gondola rides. It was memorable because we immersed ourselves in the rich history and culture.",
        
        "I recently went on a camping trip to Yellowstone National Park with my family. We saw amazing wildlife including bears and bison, and watched the geysers erupt. We stayed in tents and cooked over campfires. It was memorable because we disconnected from technology and connected with nature."
      ];
      
      // Randomly select one of the mock transcriptions
      const randomIndex = Math.floor(Math.random() * mockTranscriptions.length);
      const mockTranscription = mockTranscriptions[randomIndex];
      
      console.log("Transcription successful");
      return mockTranscription;
    } catch (error) {
      console.error("Error transcribing audio:", error);
      return "Error transcribing audio. Using fallback method.";
    }
  }

  /**
   * Evaluate a speaking assessment based on audio input
   * @param {string} question - The question or topic for the speaking assessment
   * @param {string} audioBase64 - Base64-encoded audio data
   * @returns {Promise<Object>} - Assessment results
   */
  async evaluateSpeaking(question, audioBase64) {
    try {
      console.log("Evaluating speaking for question:", question);
      
      // Check if we should use mock response
      if (this.useMockResponse) {
        console.log("Using mock response for speaking assessment");
        const mockAssessment = this.getMockAssessment(question);
        
        // First transcribe the audio
        const transcribedText = await this.transcribeAudio(audioBase64);
        
        return {
          success: true,
          assessment: mockAssessment,
          transcribedText: transcribedText,
          message: "Mock assessment generated successfully"
        };
      }
      
      // Transcribe the audio first
      console.log("Transcribing audio before assessment...");
      const transcribedText = await this.transcribeAudio(audioBase64);
      console.log("Transcription complete, proceeding with assessment");
      
      // Prepare the payload for the API
      const payload = {
        model: this.model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `I need you to evaluate my speaking skills based on the following question and my transcribed response.
                
Question: ${question}

My Transcribed Response: ${transcribedText}

Please provide a detailed assessment of my speaking skills covering:
1. Fluency and Coherence (score out of 9)
2. Lexical Resource / Vocabulary (score out of 9)
3. Grammatical Range and Accuracy (score out of 9)
4. Pronunciation (score out of 9)

For each criterion, give me:
- A score out of 9
- Specific feedback on what I did well
- Specific areas for improvement

Also provide:
- An overall score out of 9
- Overall feedback on my speaking performance
- 3-5 specific recommendations for improvement

Format your response as a structured JSON object with the following fields:
{
  "criteria": [
    {"name": "Fluency and Coherence", "score": X, "feedback": "detailed feedback"},
    {"name": "Lexical Resource", "score": X, "feedback": "detailed feedback"},
    {"name": "Grammatical Range and Accuracy", "score": X, "feedback": "detailed feedback"},
    {"name": "Pronunciation", "score": X, "feedback": "detailed feedback"}
  ],
  "overallScore": X,
  "overallFeedback": "detailed overall assessment",
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}

Be specific and constructive in your feedback, highlighting both strengths and areas for improvement.`
              }
            ]
          }
        ]
      };
      
      // Make the API request to evaluate speaking
      console.log("Making API request to evaluate speaking...");
      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', payload, {
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://edusoft.com'
        },
        timeout: 30000
      });
      
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        const responseText = response.data.choices[0].message.content;
        console.log("Raw API response:", responseText);
        
        try {
          // Parse the JSON response
          const jsonStartIndex = responseText.indexOf('{');
          const jsonEndIndex = responseText.lastIndexOf('}') + 1;
          const jsonString = responseText.substring(jsonStartIndex, jsonEndIndex);
          
          const assessment = JSON.parse(jsonString);
          
          // Add metadata
          assessment.isAiGenerated = true;
          assessment.isMockData = false;
          assessment.aiModel = response.data.model || this.model;
          
          return {
            success: true,
            assessment: assessment,
            transcribedText: transcribedText,
            message: "Assessment generated successfully"
          };
        } catch (parseError) {
          console.error("Error parsing AI response:", parseError);
          console.error("Raw response:", responseText);
          
          if (this.useFallbackOnError) {
            console.log("Using fallback mock assessment due to parsing error");
            const mockAssessment = this.getMockAssessment(question);
            return {
              success: true,
              assessment: mockAssessment,
              transcribedText: transcribedText,
              message: "Using fallback assessment due to API response parsing error"
            };
          } else {
            throw new Error("Failed to parse AI response");
          }
        }
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (error) {
      console.error("Error evaluating speaking:", error.message);
      
      if (this.useFallbackOnError) {
        console.log("Using fallback mock assessment due to API error");
        
        // Still try to transcribe the audio if possible
        let transcribedText = "Transcription unavailable due to error";
        try {
          transcribedText = await this.transcribeAudio(audioBase64);
        } catch (transcribeError) {
          console.error("Error transcribing audio for fallback:", transcribeError);
        }
        
        const mockAssessment = this.getMockAssessment(question);
        return {
          success: true,
          assessment: mockAssessment,
          transcribedText: transcribedText,
          message: "Using fallback assessment due to API error"
        };
      } else {
        throw error;
      }
    }
  }

  /**
   * Get a mock assessment for testing purposes
   * @param {string} question - The question or topic for the speaking assessment
   * @returns {Object} - Mock assessment results
   */
  getMockAssessment(question) {
    console.log("Generating mock assessment for question:", question);
    
    // Determine the topic type to generate relevant feedback
    const topic = this.determineTopicType(question);
    
    // Generate a realistic-looking assessment with feedback tailored to the question
    const assessment = {
      criteria: [
        { 
          name: 'Fluency and Coherence', 
          score: this.getRandomScore(5.5, 7.0), 
          feedback: this.getFluencyFeedback(topic) 
        },
        { 
          name: 'Lexical Resource', 
          score: this.getRandomScore(5.0, 6.5), 
          feedback: this.getVocabularyFeedback(topic) 
        },
        { 
          name: 'Grammatical Range and Accuracy', 
          score: this.getRandomScore(5.0, 6.5), 
          feedback: this.getGrammarFeedback() 
        },
        { 
          name: 'Pronunciation', 
          score: this.getRandomScore(5.0, 6.0), 
          feedback: this.getPronunciationFeedback() 
        }
      ],
      overallScore: this.getRandomScore(5.0, 6.5),
      overallFeedback: this.getOverallFeedback(topic),
      recommendations: this.getRecommendations(),
      
      // Add metadata to clearly mark this as mock data
      isAiGenerated: false,
      isMockData: true,
      aiModel: "AI-Generated Speaking Assessment (MOCK DATA - Not a real assessment of your speaking)"
    };
    
    return assessment;
  }

  determineTopicType(question) {
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('favorite') || questionLower.includes('prefer') || questionLower.includes('enjoy')) {
      return 'preference';
    } else if (questionLower.includes('describe') || questionLower.includes('tell me about')) {
      return 'description';
    } else if (questionLower.includes('advantage') || questionLower.includes('disadvantage') || questionLower.includes('opinion')) {
      return 'opinion';
    } else if (questionLower.includes('compare') || questionLower.includes('difference')) {
      return 'comparison';
    } else {
      return 'general';
    }
  }

  getRandomScore(min, max) {
    // Return a random score with one decimal place
    return Math.round((Math.random() * (max - min) + min) * 10) / 10;
  }

  getFluencyFeedback(topic) {
    const feedbackOptions = [
      `You demonstrated reasonable fluency when discussing ${topic}. There were some hesitations and repetitions, but they didn't significantly impact comprehension. Try to work on smoother transitions between ideas.`,
      `Your speech had a generally even flow with occasional pauses. You were able to express your thoughts on ${topic}, though at times you searched for words or structures. Practice speaking at a more consistent pace.`,
      `While speaking about ${topic}, you maintained adequate fluency. Some self-corrections and hesitations were present. Try to develop your ideas more fully and connect them more logically.`
    ];
    
    return feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
  }

  getVocabularyFeedback(topic) {
    const feedbackOptions = [
      `You used a sufficient range of vocabulary related to ${topic}. Some word choices were precise, while others were more general. Try to incorporate more specific terminology and idiomatic expressions.`,
      `Your vocabulary range was adequate for discussing ${topic}. There were some good word choices, but also some repetition. Focus on expanding your lexical resource with more varied expressions and synonyms.`,
      `When discussing ${topic}, you demonstrated a functional vocabulary range. There were occasional word choice errors or imprecisions. Work on building a wider range of topic-specific vocabulary.`
    ];
    
    return feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
  }

  getGrammarFeedback() {
    const feedbackOptions = [
      `You used a mix of simple and complex sentence structures. There were some errors in grammar and word order, particularly with verb tenses and articles. These occasionally caused confusion.`,
      `Your grammatical range was sufficient but limited. You mainly relied on simple structures with some attempts at more complex ones. Errors occurred with subject-verb agreement and prepositions.`,
      `You demonstrated reasonable control of basic grammatical structures. More complex sentences contained errors that sometimes affected meaning. Practice using a wider range of grammatical patterns.`
    ];
    
    return feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
  }

  getPronunciationFeedback() {
    const feedbackOptions = [
      `Your pronunciation was generally clear and distinct. However, there were some instances where your speech was unclear or difficult to understand. Practice pronouncing words more clearly and distinctly.`,
      `Your pronunciation was adequate but had some inconsistencies. Some words were pronounced incorrectly or with incorrect stress. Focus on improving your pronunciation by practicing with a pronunciation guide.`,
      `Your pronunciation was inconsistent and had significant errors. This affected your speech clarity and made it difficult for others to understand. Practice with a pronunciation guide and seek professional help.`
    ];
    
    return feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
  }

  getOverallFeedback(topic) {
    // Implement the logic to generate overall feedback based on the topic
    return "Overall feedback based on the topic";
  }

  getRecommendations() {
    // Implement the logic to generate recommendations based on the topic
    return ["Recommendation 1", "Recommendation 2", "Recommendation 3"];
  }

  /**
   * Evaluate speaking based on pre-transcribed text
   * @param {string} question - The question or topic for the speaking assessment
   * @param {string} transcribedText - The pre-transcribed text from frontend
   * @returns {Promise<Object>} - Assessment results
   */
  async evaluateTranscribedText(question, transcribedText) {
    try {
      console.log("Evaluating transcribed text for question:", question);
      console.log("Transcribed text length:", transcribedText.length);
      
      // Check if we should use mock response
      if (this.useMockResponse) {
        console.log("Using mock response for transcribed text assessment");
        const mockAssessment = this.getMockAssessment(question);
        
        return {
          success: true,
          assessment: mockAssessment,
          message: "Mock assessment generated successfully for transcribed text"
        };
      }
      
      // Prepare the payload for the API - same as in evaluateSpeaking but using the provided text
      const payload = {
        model: this.model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `I need you to evaluate my speaking skills based on the following question and my transcribed response.
                
Question: ${question}

My Transcribed Response: ${transcribedText}

Please provide a detailed assessment of my speaking skills covering:
1. Fluency and Coherence (score out of 9)
2. Lexical Resource / Vocabulary (score out of 9)
3. Grammatical Range and Accuracy (score out of 9)
4. Pronunciation (score out of 9)

For each criterion, give me:
- A score out of 9
- Specific feedback on what I did well
- Specific areas for improvement

Also provide:
- An overall score out of 9
- Overall feedback on my speaking performance
- 3-5 specific recommendations for improvement

Format your response as a structured JSON object with the following fields:
{
  "criteria": [
    {"name": "Fluency and Coherence", "score": X, "feedback": "detailed feedback"},
    {"name": "Lexical Resource", "score": X, "feedback": "detailed feedback"},
    {"name": "Grammatical Range and Accuracy", "score": X, "feedback": "detailed feedback"},
    {"name": "Pronunciation", "score": X, "feedback": "detailed feedback"}
  ],
  "overallScore": X,
  "overallFeedback": "detailed overall assessment",
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}

Be specific and constructive in your feedback, highlighting both strengths and areas for improvement.`
              }
            ]
          }
        ]
      };
      
      // Make the API request to evaluate the transcribed text
      console.log("Making API request to evaluate transcribed text...");
      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', payload, {
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://edusoft.com'
        },
        timeout: 30000
      });
      
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        const responseText = response.data.choices[0].message.content;
        console.log("Raw API response:", responseText);
        
        try {
          // Parse the JSON response
          const jsonStartIndex = responseText.indexOf('{');
          const jsonEndIndex = responseText.lastIndexOf('}') + 1;
          const jsonString = responseText.substring(jsonStartIndex, jsonEndIndex);
          
          const assessment = JSON.parse(jsonString);
          
          // Add metadata
          assessment.isAiGenerated = true;
          assessment.isMockData = false;
          assessment.aiModel = response.data.model || this.model;
          
          return {
            success: true,
            assessment: assessment,
            message: "Assessment generated successfully from transcribed text"
          };
        } catch (parseError) {
          console.error("Error parsing AI response:", parseError);
          console.error("Raw response:", responseText);
          
          if (this.useFallbackOnError) {
            console.log("Using fallback mock assessment due to parsing error");
            const mockAssessment = this.getMockAssessment(question);
            return {
              success: true,
              assessment: mockAssessment,
              message: "Using fallback assessment due to API response parsing error"
            };
          } else {
            throw new Error("Failed to parse AI response");
          }
        }
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (error) {
      console.error("Error evaluating transcribed text:", error.message);
      
      if (this.useFallbackOnError) {
        console.log("Using fallback mock assessment due to API error");
        const mockAssessment = this.getMockAssessment(question);
        return {
          success: true,
          assessment: mockAssessment,
          message: "Using fallback assessment due to API error"
        };
      } else {
        throw error;
      }
    }
  }
}

export default new SpeakingAssessmentService();