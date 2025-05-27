# Embedding Instructions for CEFR Assessment JSON Data

This document provides instructions on how to use and embed the `cefr_assessment_data.json` file, which contains the structured content for the CEFR-aligned language skills assessment (A1-C2 for Reading, Writing, Listening, and Speaking).

## 1. Understanding the JSON Structure

The `cefr_assessment_data.json` file is organized as follows:

```json
{
  "project_title": "CEFR-Aligned Language Skills Assessment (A1-C2)",
  "levels": ["A1", "A2", "B1", "B2", "C1", "C2"],
  "skills": ["Reading", "Writing", "Listening", "Speaking"],
  "assessment_content": {
    "Reading": {
      "A1": {
        "level_description": "I can understand familiar names, words and very simple sentences...",
        "tasks": [
          {
            "task_title": "Section 1: Understanding Familiar Names and Words (Matching)",
            "questions": [
              {
                "question_text": "(Image of a CAT)",
                "options": [
                  {"option_letter": "A", "option_text": "Dog"},
                  {"option_letter": "B", "option_text": "Cat"},
                  {"option_letter": "C", "option_text": "Bird"}
                ],
                "correct_answer": "B"
              }
              // ... more questions
            ],
            "question_type": "mcq"
          }
          // ... more tasks/sections for A1 Reading
        ],
        "answer_key": {
          "Question 1": "B",
          "Question 2": "B"
          // ... more answers
        },
        "grading_rubric": null // Rubrics are for Writing/Speaking
      }
      // ... other levels for Reading
    },
    "Writing": {
      "A1": {
        "level_description": "I can write a short, simple postcard...",
        "tasks": [
          {
            "task_title": "Task 1: Filling in a Simple Form (e.g., Language School Registration)",
            "task_prompt": "You want to join a language school. Fill in this registration form...",
            "question_type": "open_ended"
          }
          // ... more tasks for A1 Writing
        ],
        "answer_key": null, // Answer keys are for Reading/Listening
        "grading_rubric": "# CEFR A1 Writing Assessment - Grading Rubric\n\n... (raw Markdown content of the rubric) ..."
      }
      // ... other levels for Writing
    }
    // ... Listening and Speaking skills similarly structured
  }
}
```

**Key fields:**
*   `project_title`, `levels`, `skills`: Metadata about the assessment.
*   `assessment_content`: The main object holding data for each skill and level.
*   `level_description`: The CEFR descriptor for that skill and level.
*   `tasks`: An array of tasks or sections for that skill/level.
    *   `task_title`: The title of the task/section.
    *   `questions` (for Reading/Listening): An array of question objects.
        *   `question_text`: The text of the question (may include references to images or audio that need separate handling).
        *   `options`: An array of multiple-choice options (if applicable).
        *   `correct_answer`: The correct answer letter or text.
    *   `task_prompt` (for Writing/Speaking): The prompt or instructions for the task.
    *   `question_type`: Indicates if it's "mcq" (multiple-choice question) or "open_ended".
*   `answer_key` (for Reading/Listening): An object mapping question identifiers to their correct answers (this information is also integrated into individual question objects).
*   `grading_rubric` (for Writing/Speaking): The raw Markdown content of the grading rubric for that skill/level.

## 2. Accessing Data Programmatically

You can load and parse this JSON file in various programming languages. Here's a conceptual example in JavaScript:

```javascript
async function loadAssessmentData() {
  try {
    const response = await fetch('path/to/your/cefr_assessment_data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Could not load assessment data:", error);
    return null;
  }
}

async function displayAssessment() {
  const assessmentData = await loadAssessmentData();
  if (!assessmentData) return;

  // Example: Get A1 Reading tasks
  const a1ReadingTasks = assessmentData.assessment_content.Reading.A1.tasks;
  console.log("A1 Reading Tasks:", a1ReadingTasks);

  // Example: Get B1 Writing Task 1 prompt
  const b1WritingTask1Prompt = assessmentData.assessment_content.Writing.B1.tasks[0].task_prompt;
  console.log("B1 Writing Task 1 Prompt:", b1WritingTask1Prompt);

  // Example: Get C1 Speaking Task 1 Rubric (raw Markdown)
  const c1SpeakingRubric = assessmentData.assessment_content.Speaking.C1.grading_rubric;
  console.log("C1 Speaking Rubric (Markdown):", c1SpeakingRubric);

  // You would then use this data to dynamically render HTML content
  // For example, to display a question:
  const firstA1ReadingQuestion = a1ReadingTasks[0].questions[0];
  const questionElement = document.createElement('div');
  questionElement.innerHTML = `
    <p>${firstA1ReadingQuestion.question_text}</p>
    <ul>
      ${firstA1ReadingQuestion.options.map(opt => `<li>${opt.option_letter}) ${opt.option_text}</li>`).join('')}
    </ul>
    <p>Correct Answer: ${firstA1ReadingQuestion.correct_answer}</p>
  `;
  // document.body.appendChild(questionElement); // Append to your desired container
}

displayAssessment();
```

## 3. Embedding in a Web Page

There are several ways to embed this assessment content into a website or web application:

### a) Client-Side Rendering (JavaScript)
*   Host the `cefr_assessment_data.json` file on your web server or a CDN.
*   Use JavaScript (as shown in the example above) to fetch the JSON file when the page loads.
*   Dynamically create HTML elements to display questions, prompts, options, etc., based on the JSON data.
*   This approach is good for interactive assessments where content might change based on user selections (e.g., choosing a level/skill).

### b) Server-Side Rendering
*   Your server-side language (e.g., Python with Flask/Django, Node.js with Express, PHP) can read the JSON file.
*   When a user requests a page for a specific assessment part, the server processes the JSON and generates the HTML page with the content already embedded.
*   This can be better for SEO and initial page load performance for static views of the content.

### c) Static Site Generators
*   If you are using a static site generator (e.g., Jekyll, Hugo, Next.js for static export), you can often place the JSON file in a data directory.
*   The generator can then read this data at build time and create static HTML pages for each part of the assessment.

## 4. Handling Specific Content Types

*   **Images:** Question prompts like `"(Image of a CAT)"` indicate that an external image is required. The JSON does not contain the images themselves. You will need to host these images separately and modify your rendering logic to display the correct image based on the question text or a unique image ID (if you add one).
*   **Audio Files (for Listening/Speaking):** Similarly, listening tasks will refer to audio scripts (e.g., `"Audio Script 1.1 (Short Monologue): ..."`). The actual audio files (.mp3, .wav, etc.) are not in the JSON. You need to:
    1.  Record or source these audio files.
    2.  Host them on your server/CDN.
    3.  Modify your rendering logic to include an HTML5 audio player (`<audio controls src="path/to/audio_file.mp3"></audio>`) linked to the correct audio file for each listening task. The JSON provides the *script* which can be used as a transcript or to name your audio files consistently.
*   **Grading Rubrics (Markdown):** The `grading_rubric` field for Writing and Speaking tasks contains the rubric as raw Markdown text. To display this nicely on a webpage, you will need a Markdown-to-HTML converter. Many JavaScript libraries (e.g., `marked.js`, `Showdown.js`) or server-side tools can do this.
    ```javascript
    // Example using marked.js (client-side)
    // <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    // const htmlRubric = marked.parse(c1SpeakingRubric);
    // document.getElementById('rubric-container').innerHTML = htmlRubric;
    ```

## 5. Considerations for an Interactive Assessment Platform

*   **User Interface (UI):** Design a clear UI for users to select CEFR level and skill.
*   **Navigation:** Allow users to navigate between tasks and questions.
*   **Answer Submission:** For MCQs, implement a way for users to select answers. For open-ended tasks (Writing/Speaking), provide text areas or audio recording functionality.
*   **Scoring:**
    *   MCQs can be auto-scored by comparing user answers to the `correct_answer` in the JSON.
    *   Writing/Speaking tasks will require manual grading based on the provided rubrics. Your platform might need a way for assessors to view submissions and apply rubric scores.
*   **User Progress:** Consider how to save and display user progress if it's a longer assessment.

By following these instructions, you can effectively integrate the comprehensive CEFR assessment data into your web-based language learning or testing platform.

