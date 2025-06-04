import json
import os
import re

# --- Helper Functions ---
def read_md_file(filepath):
    """Reads content from a Markdown file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f"Warning: File not found - {filepath}")
        return None
    except Exception as e:
        print(f"Error reading file {filepath}: {e}")
        return None

def parse_mcq_section(section_content, section_title_pattern):
    """Parses a section of MCQ questions from Markdown content."""
    questions = []
    # Regex to find individual questions, options, and the correct answer
    # This is a simplified parser and might need adjustments for complex MD structures
    question_blocks = re.split(r'\n---\n', section_content.strip()) # Split by --- separator if used
    if len(question_blocks) <=1 and "Question" in section_content:
        # If no ---, try splitting by "Question X:"
        question_blocks = re.split(r'(?=^Question \d+[:\.])', section_content.strip(), flags=re.MULTILINE)
        question_blocks = [q for q in question_blocks if q.strip() and q.startswith("Question")]

    current_question_text = ""
    options = [] # Store as list of dicts: [{"option_letter": "A", "option_text": "..."}, ...]
    correct_answer_letter = None

    for block in question_blocks:
        block = block.strip()
        if not block: continue

        question_match = re.search(r"^(Question \d+[:\.](?:\s*\(.*?\))?)(.*?)(?=\n\s*[A-Z]\)|\n\s*Answer:|$)", block, re.DOTALL | re.MULTILINE)
        if question_match:
            if current_question_text: # Save previous question
                questions.append({
                    "question_text": current_question_text.strip(),
                    "options": options,
                    "correct_answer": correct_answer_letter # This will be filled by answer key parser later
                })
                options = []
                correct_answer_letter = None

            current_question_text = question_match.group(2).strip()
            # Extract options from the rest of the block
            option_matches = re.findall(r"^\s*([A-Z])\)\s*(.*?)$", block[question_match.end():], re.MULTILINE)
            for opt_letter, opt_text in option_matches:
                options.append({"option_letter": opt_letter, "option_text": opt_text.strip()})
        else: # If it's not a new question block, it might be part of the current question's options or text
            if not current_question_text and block.startswith("Question"):
                 # Fallback for questions that might not have matched the primary regex
                q_text_match = re.search(r"Question \d+[:\.](.*?)(?=\n\s*[A-Z]\)|\n\s*Answer:|$)", block, re.DOTALL)
                if q_text_match:
                    current_question_text = q_text_match.group(1).strip()
                option_matches = re.findall(r"^\s*([A-Z])\)\s*(.*?)$", block, re.MULTILINE)
                for opt_letter, opt_text in option_matches:
                    options.append({"option_letter": opt_letter, "option_text": opt_text.strip()})
            elif current_question_text: # Append to existing question text if it's a continuation
                current_question_text += "\n" + block

    if current_question_text: # Save the last question
        questions.append({
            "question_text": current_question_text.strip(),
            "options": options,
            "correct_answer": correct_answer_letter
        })

    return questions

def parse_open_ended_section(section_content, section_title_pattern):
    """Parses a section of open-ended questions/tasks from Markdown content."""
    tasks = []
    # Split by "Task X:" or similar, or by "---" if used as separator
    task_blocks = re.split(r'\n---\n', section_content.strip())
    if len(task_blocks) <= 1 and "Task" in section_content:
        task_blocks = re.split(r'(?=^## Task \d+[:\.])', section_content.strip(), flags=re.MULTILINE)
        task_blocks = [t for t in task_blocks if t.strip() and t.startswith("## Task")]

    for i, block in enumerate(task_blocks):
        block = block.strip()
        if not block: continue

        title_match = re.search(r"^## Task \d+[:\.](.*?)(?=\n\n|$)", block, re.MULTILINE)
        task_title = title_match.group(1).strip() if title_match else f"Task {i+1}"
        
        prompt_match = re.search(r"(?:\*\*Examiner/Prompt:\*\*|\*\*Prompt:\*\*|\*\*Instructions:\*\*)\s*(.*?)(?=\n\n\*\*Expected Candidate Response Type|\n\n\*\*Scoring Rubric Focus|\n\n---\|$)", block, re.DOTALL | re.MULTILINE)
        task_prompt = prompt_match.group(1).strip() if prompt_match else block # Fallback to whole block if specific prompt not found
        
        # For writing tasks, sometimes the prompt is simpler
        if not prompt_match and "Write about" in block:
            task_prompt = block # Take the whole block as prompt

        tasks.append({
            "task_title": task_title,
            "task_prompt": task_prompt,
            "question_type": "open_ended"
        })
    return tasks

def parse_answer_key_mcq(answer_content):
    """Parses MCQ answer key from Markdown content."""
    answers = {}
    # E.g., Question 1: Answer: B) Cat or Question 1.1: Answer: B)
    answer_matches = re.findall(r"^(?:Question|Task) (\d+(?:\.\d+)?):.*?Answer:\s*([A-Z])\)?", answer_content, re.MULTILINE)
    for q_num, ans_letter in answer_matches:
        answers[f"Question {q_num}"] = ans_letter
    
    # Fallback for different answer formats
    if not answers:
        answer_matches_simple = re.findall(r"^(?:Question|Task) (\d+(?:\.\d+)?):\s*([A-Z])\)?", answer_content, re.MULTILINE)
        for q_num, ans_letter in answer_matches_simple:
            answers[f"Question {q_num}"] = ans_letter
    if not answers: # e.g. Question 3.2: What color is the dog? Answer: brown
        answer_matches_text = re.findall(r"^(?:Question|Task) (\d+(?:\.\d+)?):.*?Answer:\s*(.*?)$", answer_content, re.MULTILINE)
        for q_num, ans_text in answer_matches_text:
            answers[f"Question {q_num}"] = ans_text.strip()

    return answers

def parse_rubric(rubric_content):
    """Parses a grading rubric from Markdown content. This is a placeholder and needs a robust parser."""
    # This is highly complex to parse generically due to table structures in Markdown.
    # For now, we'll store the raw Markdown of the rubric.
    # A more sophisticated approach would parse the table into a structured JSON object.
    return rubric_content # Return raw Markdown

# --- Main Data Structure ---
cefr_assessment_data = {
    "project_title": "CEFR-Aligned Language Skills Assessment (A1-C2)",
    "levels": ["A1", "A2", "B1", "B2", "C1", "C2"],
    "skills": ["Reading", "Writing", "Listening", "Speaking"],
    "assessment_content": {}
}

# --- File Paths (adjust if your directory structure is different) ---
base_path = "/home/ubuntu/"

# --- Populate Data ---
for skill in cefr_assessment_data["skills"]:
    cefr_assessment_data["assessment_content"][skill] = {}
    for level in cefr_assessment_data["levels"]:
        cefr_assessment_data["assessment_content"][skill][level] = {
            "level_description": "", # Placeholder
            "tasks": [],
            "answer_key": None, # For Reading/Listening
            "grading_rubric": None # For Writing/Speaking
        }

        content_filename = f"cefr_{skill.lower()}_{level.lower()}_content.md"
        content_filepath = os.path.join(base_path, content_filename)
        md_content = read_md_file(content_filepath)

        if md_content:
            # Extract level description (assuming it's at the start of the content file)
            desc_match = re.search(r"^\*\*Based on CEFR [A-Z0-9]+ " + skill + " Descriptor:\*\*\s*\"(.*?)\"", md_content, re.MULTILINE | re.DOTALL)
            if desc_match:
                cefr_assessment_data["assessment_content"][skill][level]["level_description"] = desc_match.group(1).strip()
            
            # Split content into sections/tasks. This is a heuristic.
            # Reading/Listening often have sections, Writing/Speaking have tasks.
            sections = re.split(r'\n## (?:Section|Task) \d+[:\.]', md_content)
            if len(sections) > 1:
                sections = sections[1:] # remove content before the first section/task
            else: # if no ## Section/Task, use --- as separator or treat whole content as one task
                sections = re.split(r'\n---\n', md_content)
                if len(sections) == 1 and "Question 1:" not in md_content and "Task 1:" not in md_content and skill in ["Writing", "Speaking"]:
                     # For writing/speaking, if no clear sections, treat the whole thing as a prompt for a single task
                    cefr_assessment_data["assessment_content"][skill][level]["tasks"].append({
                        "task_title": f"{skill} {level} Main Task",
                        "task_prompt": md_content.strip(),
                        "question_type": "open_ended"
                    })

            parsed_tasks_for_level = []
            for i, section_text in enumerate(sections):
                section_text = section_text.strip()
                if not section_text: continue

                # Try to get a title for the section/task
                title_match = re.search(r"^(.*?)(?=\n)", section_text)
                section_title = title_match.group(1).strip() if title_match else f"Part {i+1}"

                if skill in ["Reading", "Listening"]:
                    # Assume MCQs or similar for Reading/Listening
                    parsed_questions = parse_mcq_section(section_text, section_title)
                    if parsed_questions:
                        parsed_tasks_for_level.append({
                            "task_title": section_title,
                            "questions": parsed_questions,
                            "question_type": "mcq" # Or could be fill-in-the-blanks etc.
                        })
                elif skill in ["Writing", "Speaking"]:
                    # Assume open-ended tasks for Writing/Speaking
                    parsed_open_tasks = parse_open_ended_section(section_text, section_title)
                    if parsed_open_tasks:
                        parsed_tasks_for_level.extend(parsed_open_tasks)
            
            if parsed_tasks_for_level:
                 cefr_assessment_data["assessment_content"][skill][level]["tasks"] = parsed_tasks_for_level
            elif not cefr_assessment_data["assessment_content"][skill][level]["tasks"]: # if sections didn't parse but it's not writing/speaking single task
                 # Fallback for content that doesn't split well into sections but isn't a single writing/speaking task
                 # This is a basic fallback, might need refinement
                 if skill in ["Reading", "Listening"]:
                    all_questions = parse_mcq_section(md_content, f"{skill} {level} Questions")
                    if all_questions:
                        cefr_assessment_data["assessment_content"][skill][level]["tasks"].append({
                            "task_title": f"{skill} {level} Main Section",
                            "questions": all_questions,
                            "question_type": "mcq"
                        })

        # Load Answer Keys for Reading and Listening
        if skill in ["Reading", "Listening"]:
            answer_filename = f"cefr_{skill.lower()}_{level.lower()}_answers.md"
            answer_filepath = os.path.join(base_path, answer_filename)
            answer_md = read_md_file(answer_filepath)
            if answer_md:
                parsed_answers = parse_answer_key_mcq(answer_md)
                cefr_assessment_data["assessment_content"][skill][level]["answer_key"] = parsed_answers
                # Integrate answers into questions
                for task_group in cefr_assessment_data["assessment_content"][skill][level]["tasks"]:
                    if "questions" in task_group:
                        for i, q_data in enumerate(task_group["questions"]):
                            # Construct a key like "Question 1.1" or "Question 1" to match answer key
                            # This needs to be robust based on how questions are numbered in content and answers
                            # Assuming questions are numbered sequentially within their task_group for now
                            # This is a simplification. A better way would be to have unique IDs for questions.
                            q_key_style1 = f"Question {i+1}" # e.g. Question 1, Question 2
                            # Try to find a more specific key if possible from the question text itself
                            q_num_match = re.match(r"Question (\d+(?:\.\d+)?)[:\.]", q_data["question_text"], re.IGNORECASE)
                            q_key_from_text = f"Question {q_num_match.group(1)}" if q_num_match else q_key_style1

                            if q_key_from_text in parsed_answers:
                                q_data["correct_answer"] = parsed_answers[q_key_from_text]
                            elif q_key_style1 in parsed_answers: # Fallback
                                q_data["correct_answer"] = parsed_answers[q_key_style1]

        # Load Grading Rubrics for Writing and Speaking
        if skill in ["Writing", "Speaking"]:
            rubric_filename = f"cefr_{skill.lower()}_{level.lower()}_rubric.md"
            rubric_filepath = os.path.join(base_path, rubric_filename)
            rubric_md = read_md_file(rubric_filepath)
            if rubric_md:
                # For now, storing raw rubric MD. A proper parser would be complex.
                cefr_assessment_data["assessment_content"][skill][level]["grading_rubric"] = rubric_md

# --- Save to JSON --- #
output_json_path = os.path.join(base_path, "cefr_assessment_data.json")
try:
    with open(output_json_path, 'w', encoding='utf-8') as f_json:
        json.dump(cefr_assessment_data, f_json, indent=4, ensure_ascii=False)
    print(f"Successfully created JSON: {output_json_path}")
except Exception as e:
    print(f"Error writing JSON file: {e}")


