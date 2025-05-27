// writingAssessmentService.js
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

/**
 * Service for evaluating writing assessments using AI
 */
class WritingAssessmentService {
  constructor() {
    // Use the provided OpenRouter API key or fall back to environment variable
    this.openRouterApiKey = "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";
    this.model = "meta-llama/llama-3.3-8b-instruct:free";
    console.log("WritingAssessmentService initialized with model:", this.model);
  }

  /**
   * Evaluate a writing assessment based on the 5 academic criteria
   * @param {string} question - The question or prompt for the user
   * @param {string} answer - The user's written response
   * @returns {Promise<Object>} - Assessment results with scores for each criteria
   */
  async evaluateWriting(question, answer) {
    console.log("evaluateWriting called with:", { 
      questionLength: question?.length, 
      answerLength: answer?.length 
    });
    
    try {
      // Define the prompt for evaluating academic writing
      const prompt = `
You are a university-level writing assessment expert. Please evaluate the following writing sample in response to the given prompt. 
Rate each of the following 5 criteria on a scale of 1-10, where 1 is very poor and 10 is excellent:

1. Coherence and Clarity: Logical flow of ideas, clear connections between sentences and paragraphs, understandability.
2. Organization and Structure: Clear introduction, body, and conclusion, logical ordering of ideas, effective transitions.
3. Focus and Content Development: Addressing the prompt fully, staying on topic, developing ideas with specific details.
4. Vocabulary and Word Choice: Precision and appropriateness of vocabulary, lexical diversity and sophistication.
5. Grammar and Conventions: Correctness in grammar, spelling, punctuation, and other writing mechanics.

Prompt: "${question}"

Student Answer: "${answer}"

Please provide:
1. A numeric score (1-10) for each of the 5 criteria 
2. Brief comments on strengths and areas for improvement for each criteria
3. An overall percentage score out of 100
4. A few sentences of overall feedback
5. Three specific, actionable recommendations for how the student can improve their writing skills based on their performance
`;

      console.log("Preparing to send request to OpenRouter API");
      console.log("API Key (first 5 chars):", this.openRouterApiKey.substring(0, 5) + "...");
      
      // Make the request to OpenRouter API
      const requestConfig = {
        url: 'https://openrouter.ai/api/v1/chat/completions',
        method: 'post',
        data: {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 800
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'HTTP-Referer': 'https://edusoft.com', 
          'X-Title': 'EduSoft Writing Assessment'
        }
      };
      
      console.log("Request configuration:", {
        url: requestConfig.url,
        method: requestConfig.method,
        model: requestConfig.data.model,
        headers: {
          ...requestConfig.headers,
          'Authorization': 'Bearer sk-****' // Masked for security
        }
      });
      
      console.log("Sending request to OpenRouter API...");
      const response = await axios(requestConfig);
      
      console.log("Response received from OpenRouter API:", {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        dataKeys: Object.keys(response.data || {}),
        hasChoices: response.data?.choices?.length > 0,
        firstChoiceContent: response.data?.choices?.[0]?.message?.content?.substring(0, 50) + "..."
      });

      // Parse the response to extract scores and feedback
      const aiResponse = response.data.choices[0].message.content;
      console.log("AI response content (first 100 chars):", aiResponse.substring(0, 100) + "...");
      
      // Parse the AI response to extract structured data
      console.log("Parsing AI response...");
      const parsedResult = this.parseAIResponse(aiResponse);
      console.log("Parsed result:", {
        criteriaCount: parsedResult.criteria.length,
        overallScore: parsedResult.overallScore,
        feedbackLength: parsedResult.overallFeedback.length
      });
      
      return parsedResult;
    } catch (error) {
      console.error('Error evaluating writing assessment:', {
        message: error.message,
        stack: error.stack,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'No response data',
        request: error.request ? 'Request was made but no response received' : 'No request was made'
      });
      
      throw new Error(`Failed to evaluate writing assessment: ${error.message}`);
    }
  }

  /**
   * Parse the AI response to extract structured data
   * @param {string} aiResponse - The raw response from OpenAI
   * @returns {Object} - Structured assessment data
   */
  parseAIResponse(aiResponse) {
    try {
      console.log("Starting to parse AI response...");
      
      // Initialize scores object
      const assessment = {
        criteria: [
          { name: 'Coherence and Clarity', score: 0, feedback: '' },
          { name: 'Organization and Structure', score: 0, feedback: '' },
          { name: 'Focus and Content Development', score: 0, feedback: '' },
          { name: 'Vocabulary and Word Choice', score: 0, feedback: '' },
          { name: 'Grammar and Conventions', score: 0, feedback: '' }
        ],
        overallScore: 0,
        overallFeedback: '',
        recommendations: [],
        isAiGenerated: false,
        aiModel: this.model
      };

      // Find criteria scores using regex
      const coherenceMatch = aiResponse.match(/Coherence and Clarity:?\s*(\d+)/i);
      const organizationMatch = aiResponse.match(/Organization and Structure:?\s*(\d+)/i);
      const focusMatch = aiResponse.match(/Focus and Content Development:?\s*(\d+)/i);
      const vocabularyMatch = aiResponse.match(/Vocabulary and Word Choice:?\s*(\d+)/i);
      const grammarMatch = aiResponse.match(/Grammar and Conventions:?\s*(\d+)/i);
      
      console.log("Regex matches:", {
        coherenceMatch: coherenceMatch ? coherenceMatch[1] : null,
        organizationMatch: organizationMatch ? organizationMatch[1] : null,
        focusMatch: focusMatch ? focusMatch[1] : null,
        vocabularyMatch: vocabularyMatch ? vocabularyMatch[1] : null,
        grammarMatch: grammarMatch ? grammarMatch[1] : null
      });
      
      // Extract overall score percentage
      const overallMatch = aiResponse.match(/overall percentage score:?\s*(\d+)/i) || 
                         aiResponse.match(/overall score:?\s*(\d+)/i) ||
                         aiResponse.match(/(\d+)%/);
      
      console.log("Overall score match:", overallMatch ? overallMatch[1] : null);

      // Find feedback sections
      const sections = aiResponse.split(/\d+\.\s+/);
      console.log("Split sections count:", sections.length);
      
      // Extract feedback for each criterion and overall feedback
      if (coherenceMatch) assessment.criteria[0].score = parseInt(coherenceMatch[1]);
      if (organizationMatch) assessment.criteria[1].score = parseInt(organizationMatch[1]);
      if (focusMatch) assessment.criteria[2].score = parseInt(focusMatch[1]);
      if (vocabularyMatch) assessment.criteria[3].score = parseInt(vocabularyMatch[1]);
      if (grammarMatch) assessment.criteria[4].score = parseInt(grammarMatch[1]);
      
      // Extract feedback sections
      for (let i = 1; i <= 5; i++) {
        if (sections[i]) {
          const feedbackText = sections[i].trim();
          console.log(`Processing section ${i}, length: ${feedbackText.length}`);
          
          const feedbackMatch = feedbackText.match(/^([^:]+):\s*([\s\S]+?)(?=\n\n|\n\d+\.|\n$|$)/);
          if (feedbackMatch && feedbackMatch[2]) {
            assessment.criteria[i-1].feedback = feedbackMatch[2].trim();
            console.log(`Found feedback for criterion ${i}, length: ${assessment.criteria[i-1].feedback.length}`);
          } else {
            console.log(`No feedback match found for section ${i}`);
          }
        } else {
          console.log(`Section ${i} not found`);
        }
      }
      
      // Compute overall score if not provided
      if (overallMatch) {
        assessment.overallScore = parseInt(overallMatch[1]);
        console.log("Using matched overall score:", assessment.overallScore);
      } else {
        // Calculate average if not provided
        const sum = assessment.criteria.reduce((acc, criterion) => acc + criterion.score, 0);
        assessment.overallScore = Math.round((sum / 5) * 10); // Convert to percentage
        console.log("Calculated overall score:", assessment.overallScore);
      }
      
      // Extract overall feedback
      const overallFeedbackMatch = aiResponse.match(/overall feedback:?\s*([\s\S]+?)(?=recommendations|$)/i);
      if (overallFeedbackMatch) {
        assessment.overallFeedback = overallFeedbackMatch[1].trim();
        console.log("Found overall feedback, length:", assessment.overallFeedback.length);
      } else {
        console.log("No overall feedback match found");
        assessment.overallFeedback = "The writing demonstrates various strengths and weaknesses across the evaluated criteria. Continue practicing to improve your writing skills.";
      }
      
      // Extract recommendations - improved pattern matching
      const recommendationsMatch = aiResponse.match(/recommendations:?(?:\s*for\s*improvement)?:?\s*([\s\S]+?)(?=\n\n\d+\.|\n\n[A-Z]|$)/i) || 
                                aiResponse.match(/recommendations:?\s*([\s\S]+?)$/i);
                                
      if (recommendationsMatch) {
        const recommendationsText = recommendationsMatch[1].trim();
        console.log("Found recommendations, length:", recommendationsText.length);
        
        // Try to extract numbered recommendations
        const numberedRecommendations = recommendationsText.match(/\d+\.\s*(.*?)(?=\n\d+\.|$)/gs);
        if (numberedRecommendations && numberedRecommendations.length > 0) {
          assessment.recommendations = numberedRecommendations.map(rec => rec.replace(/^\d+\.\s*/, '').trim());
          assessment.isAiGenerated = true; // Flag that these are AI-generated recommendations
        } else {
          // If no numbered format, try to split by lines or sentences
          const lines = recommendationsText.split(/\n/).filter(line => line.trim().length > 0);
          if (lines.length > 1) {
            assessment.recommendations = lines;
            assessment.isAiGenerated = true; // Flag that these are AI-generated recommendations
          } else {
            // Split by sentences if it's just one big paragraph
            const sentences = recommendationsText.match(/[^.!?]+[.!?]+/g);
            if (sentences && sentences.length > 0) {
              assessment.recommendations = sentences.map(s => s.trim());
              assessment.isAiGenerated = true; // Flag that these are AI-generated recommendations
            } else {
              assessment.recommendations = [recommendationsText];
              assessment.isAiGenerated = true; // Flag that these are AI-generated recommendations
            }
          }
        }
        
        console.log("Extracted recommendations count:", assessment.recommendations.length);
        console.log("Recommendations are AI-generated:", assessment.isAiGenerated);
      } else {
        console.log("No recommendations match found, providing level-appropriate recommendations");
        assessment.isAiGenerated = false; // Flag that these are fallback recommendations
        
        // Provide appropriate recommendations based on the overall score
        if (assessment.overallScore < 20) {
          assessment.recommendations = [
            "Start with basic sentence structure practice: subject + verb + object.",
            "Learn and practice using common vocabulary words in simple sentences.",
            "Focus on writing short, clear sentences before attempting paragraphs.",
            "Practice identifying and correcting basic grammar errors.",
            "Consider working with a tutor or taking a foundational writing course."
          ];
        } else if (assessment.overallScore < 40) {
          assessment.recommendations = [
            "Practice writing simple paragraphs with a clear topic sentence.",
            "Work on connecting sentences with basic transition words.",
            "Expand your vocabulary by reading texts at your level.",
            "Practice identifying and correcting common grammar errors.",
            "Try summarizing short articles to improve comprehension and writing skills."
          ];
        } else if (assessment.overallScore < 60) {
          assessment.recommendations = [
            "Focus on organizing your writing with clear introduction, body, and conclusion.",
            "Practice developing your ideas with supporting details and examples.",
            "Work on using a wider range of vocabulary appropriate to the topic.",
            "Review and practice more complex grammar structures.",
            "Analyze model essays to understand effective writing techniques."
          ];
        } else if (assessment.overallScore < 80) {
          assessment.recommendations = [
            "Work on creating more sophisticated paragraph structures with clear transitions.",
            "Practice incorporating more nuanced vocabulary to express complex ideas.",
            "Focus on developing more compelling arguments with stronger evidence.",
            "Review advanced grammar structures to eliminate recurring errors.",
            "Practice writing in different academic styles appropriate to your field."
          ];
        } else {
          assessment.recommendations = [
            "Focus on refining your academic voice to achieve greater precision and impact.",
            "Work on incorporating more sophisticated rhetorical techniques in your writing.",
            "Practice writing more concise sentences without losing meaning or clarity.",
            "Develop more nuanced arguments that acknowledge counterpoints.",
            "Study advanced stylistic techniques used in published academic papers in your field."
          ];
        }
      }
      
      // Ensure we always have at least 3 recommendations
      if (assessment.recommendations.length < 3) {
        const additionalRecs = [
          "Read extensively in your field to improve your understanding of academic writing conventions.",
          "Practice writing regularly to develop your skills and build confidence.",
          "Seek feedback from peers or instructors to identify areas for improvement."
        ];
        
        for (let i = 0; i < additionalRecs.length && assessment.recommendations.length < 3; i++) {
          assessment.recommendations.push(additionalRecs[i]);
        }
      }
      
      console.log("Parsing complete, returning assessment object");
      return assessment;
    } catch (error) {
      console.error('Error parsing AI response:', {
        message: error.message,
        stack: error.stack,
        aiResponsePreview: aiResponse ? aiResponse.substring(0, 200) + "..." : "No AI response"
      });
      throw new Error('Failed to parse AI assessment response');
    }
  }
}

export default new WritingAssessmentService(); 