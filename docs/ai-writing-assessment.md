# AI Writing Assessment Integration

This document explains the AI-powered writing assessment system integrated into EduSoft. The system evaluates written responses based on five academic writing criteria.

## Overview

The AI writing assessment system uses OpenAI's APIs to evaluate student writing responses against university-level academic writing criteria. The evaluation focuses on:

1. **Coherence and Clarity**: Logical flow of ideas, clear connections between sentences and paragraphs
2. **Organization and Structure**: Clear introduction, body, and conclusion, logical ordering of ideas
3. **Focus and Content Development**: Addressing the prompt fully, staying on topic, developing ideas
4. **Vocabulary and Word Choice**: Precision of vocabulary, lexical diversity and sophistication
5. **Grammar and Conventions**: Correctness in grammar, spelling, punctuation, and writing mechanics

## Architecture

The system consists of:

1. **Backend Service**: Processes requests to evaluate writing samples
   - Location: `backend/services/writingAssessmentService.js`
   - API Endpoint: `POST /api/writing-assessment/evaluate`

2. **Frontend Service**: Interfaces with the backend API
   - Location: `frontend/src/services/writingAssessment.service.js`
   - Includes fallback assessment capabilities for when the API is unavailable

3. **UI Components**: Display assessment results with detailed breakdowns
   - Integration in `frontend/src/components/language/WritingAssessment.jsx`
   - Results display in `frontend/src/components/language/LanguageResults.jsx`

## Setup Instructions

1. **API Key**: Add the OpenAI API key to your `.env` file in the backend directory:
   ```
   OPENAI_API_KEY=your_openai_key_here
   ```

2. **Install Dependencies**: Make sure the required packages are installed:
   ```bash
   cd backend
   npm install axios openai
   ```

3. **Restart Server**: Restart your backend server to apply changes:
   ```bash
   npm run dev
   ```

## How It Works

1. User completes a writing task in the platform
2. When submitting, the response is sent to the backend AI service
3. The service processes the text through OpenAI's API with a specialized prompt
4. The AI evaluates the writing on the five criteria, scoring each from 1-10
5. The system parses and structures the AI response
6. Results are displayed to the user, showing:
   - Overall score out of 100
   - Individual scores for each criterion
   - Specific feedback for each criterion
   - Overall feedback and suggestions for improvement

## Fallback Mechanism

If the API is unavailable, the system falls back to a client-side assessment that:
- Counts words, sentences, and paragraphs
- Analyzes lexical diversity (unique word ratio) 
- Measures average word length
- Uses these metrics to estimate scores for each criterion

## Customization

You can customize the evaluation prompt in `backend/services/writingAssessmentService.js` to modify how assessments are performed. The current prompt instructs the AI to:

- Rate each criterion on a scale of 1-10
- Provide brief comments on strengths and areas for improvement 
- Calculate an overall percentage score
- Give comprehensive feedback

## Technical Details

The implementation uses:

- **OpenAI GPT Model**: For evaluating writing quality
- **Regex Parsing**: To extract structured assessment data from AI responses
- **React Components**: For display and user interaction
- **Server Middleware**: For processing requests with proper error handling

## Limitations

- Requires an internet connection and OpenAI API access for full functionality
- Assessment quality depends on the OpenAI model used
- Maximum text length is determined by API token limits 