import mongoose from 'mongoose';
import ProblemSolvingQuestion from '../models/problemSolvingQuestionBank.js';

const questions = [
  // Section 1: Analytical Processing (Matrix Reasoning and Pattern Recognition)
  {
    questionNumber: 1,
    section: "Analytical Processing",
    questionText: "Examine the 3×3 grid below where each cell contains a figure following specific patterns across rows and columns. Select the option that correctly completes the pattern in the empty cell.\n\n[Circle with 1 dot] [Circle with 2 dots] [Circle with 3 dots]\n[Square with 3 dots] [Square with 1 dot] [Square with 2 dots]\n[Triangle with 2 dots] [Triangle with 3 dots] [?]",
    options: [
      { letter: "A", text: "Triangle with 1 dot" },
      { letter: "B", text: "Square with 1 dot" },
      { letter: "C", text: "Circle with 1 dot" },
      { letter: "D", text: "Triangle with 4 dots" }
    ],
    correctAnswer: "A",
    timeLimit: 60,
    dimension: "Analytical Processing - Pattern Recognition",
    frameworkAlignment: "PISA Exploring and Understanding; Matrix Reasoning (Carpenter et al., 1990)",
    cognitiveProcess: "Inductive reasoning, rule identification across multiple dimensions"
  },
  {
    questionNumber: 2,
    section: "Analytical Processing",
    questionText: "Identify the pattern in the sequence below and select the next number.\n\n2, 6, 12, 20, 30, ?",
    options: [
      { letter: "A", text: "36" },
      { letter: "B", text: "40" },
      { letter: "C", text: "42" },
      { letter: "D", text: "48" }
    ],
    correctAnswer: "C",
    timeLimit: 45,
    dimension: "Analytical Processing - Pattern Recognition",
    frameworkAlignment: "Workplace Cognitive Assessment - Numerical Reasoning",
    cognitiveProcess: "Numerical pattern identification, sequence analysis"
  },
  {
    questionNumber: 3,
    section: "Analytical Processing",
    questionText: "Each row and column in the grid below follows specific rules. Identify the missing value that completes the pattern.\n\n[8] [27] [64]\n[4] [9] [16]\n[2] [3] [?]",
    options: [
      { letter: "A", text: "4" },
      { letter: "B", text: "6" },
      { letter: "C", text: "8" },
      { letter: "D", text: "12" }
    ],
    correctAnswer: "A",
    timeLimit: 60,
    dimension: "Analytical Processing - Logical Reasoning",
    frameworkAlignment: "PISA Representing and Formulating; Matrix Reasoning (Raven, 2000)",
    cognitiveProcess: "Mathematical pattern recognition, rule application"
  },
  {
    questionNumber: 4,
    section: "Analytical Processing",
    questionText: "Identify the pattern in the sequence and select the next symbol.\n\n△, □, ○, △△, □□, ○○, △△△, □□□, ?",
    options: [
      { letter: "A", text: "△△△△" },
      { letter: "B", text: "○○○" },
      { letter: "C", text: "□□□□" },
      { letter: "D", text: "△○□" }
    ],
    correctAnswer: "B",
    timeLimit: 45,
    dimension: "Analytical Processing - Pattern Recognition",
    frameworkAlignment: "ATC21S Ways of Thinking; Workplace Cognitive Assessment",
    cognitiveProcess: "Sequential pattern recognition, rule extrapolation"
  },
  {
    questionNumber: 5,
    section: "Analytical Processing",
    questionText: "The figures below follow a specific transformation pattern from left to right. Select the figure that should come next.\n\n[Image: Square] → [Image: Square with diagonal line] → [Image: Square with crossed lines] → [Image: Square with crossed lines and dot in center] → ?",
    options: [
      { letter: "A", text: "Square with crossed lines and two dots in center" },
      { letter: "B", text: "Square with crossed lines and dot in each quadrant" },
      { letter: "C", text: "Circle with crossed lines and dot in center" },
      { letter: "D", text: "Square with double crossed lines and dot in center" }
    ],
    correctAnswer: "B",
    timeLimit: 60,
    dimension: "Analytical Processing - Visual Pattern Recognition",
    frameworkAlignment: "PISA Exploring and Understanding; Workplace Cognitive Assessment",
    cognitiveProcess: "Visual transformation analysis, rule application"
  },
  {
    questionNumber: 6,
    section: "Logical Deduction and Critical Thinking",
    questionText: "Based on the statements below, select the conclusion that must be true.\n\n- All software engineers at Company X know Python.\n- Some software engineers at Company X know Java.\n- No one who knows Java knows Ruby.",
    options: [
      { letter: "A", text: "Some people who know Python also know Ruby." },
      { letter: "B", text: "Some software engineers at Company X do not know Ruby." },
      { letter: "C", text: "All software engineers at Company X know Java." },
      { letter: "D", text: "No software engineers at Company X know Ruby." }
    ],
    correctAnswer: "B",
    timeLimit: 60,
    dimension: "Analytical Processing - Logical Deduction",
    frameworkAlignment: "P21 Critical Thinking; Workplace Cognitive Assessment - Verbal Reasoning",
    cognitiveProcess: "Syllogistic reasoning, logical inference"
  },
  {
    questionNumber: 7,
    section: "Logical Deduction and Critical Thinking",
    questionText: "If the following statements are true, which conclusion must also be true?\n\n- If it rains, the soccer match will be canceled.\n- If the soccer match is canceled, the team will practice indoors.\n- The team did not practice indoors.",
    options: [
      { letter: "A", text: "It did not rain." },
      { letter: "B", text: "The soccer match was not canceled." },
      { letter: "C", text: "Both A and B are true." },
      { letter: "D", text: "Neither A nor B can be determined with certainty." }
    ],
    correctAnswer: "C",
    timeLimit: 45,
    dimension: "Analytical Processing - Logical Reasoning",
    frameworkAlignment: "PISA Representing and Formulating; Johnson-Laird (2010)",
    cognitiveProcess: "Conditional reasoning, contrapositive inference"
  },
  {
    questionNumber: 8,
    section: "Logical Deduction and Critical Thinking",
    questionText: "Five people (Alex, Ben, Clara, Diana, and Erik) are sitting in a row of five seats, numbered 1 to 5 from left to right. Their seating arrangement follows these rules:\n- Alex sits in seat 1.\n- Ben sits next to Diana.\n- Clara sits in an even-numbered seat.\n- Erik does not sit next to Clara.\n\nIn which seat does Diana sit?",
    options: [
      { letter: "A", text: "Seat 2" },
      { letter: "B", text: "Seat 3" },
      { letter: "C", text: "Seat 4" },
      { letter: "D", text: "Seat 5" }
    ],
    correctAnswer: "B",
    timeLimit: 90,
    dimension: "Analytical Processing - Constraint Satisfaction",
    frameworkAlignment: "PISA Representing and Formulating; Workplace Cognitive Assessment",
    cognitiveProcess: "Constraint application, elimination reasoning"
  },
  {
    questionNumber: 9,
    section: "Logical Deduction and Critical Thinking",
    questionText: "A company is selecting candidates for an interview based on these criteria:\n- Minimum 3 years of experience\n- Bachelor's degree in relevant field\n- Proficiency in at least two programming languages\n- Availability to start within 2 weeks\n\nBased on the profiles below, which candidate should be selected for an interview?\n\nCandidate 1: 4 years experience, Bachelor's in Computer Science, proficient in Java and Python, available in 3 weeks\nCandidate 2: 2 years experience, Master's in Information Technology, proficient in C++ and JavaScript, available immediately\nCandidate 3: 3 years experience, Bachelor's in Software Engineering, proficient in Python and Ruby, available in 1 week\nCandidate 4: 5 years experience, Associate's degree in Computer Science, proficient in Java, Python, and C#, available in 2 weeks",
    options: [
      { letter: "A", text: "Candidate 1" },
      { letter: "B", text: "Candidate 2" },
      { letter: "C", text: "Candidate 3" },
      { letter: "D", text: "Candidate 4" }
    ],
    correctAnswer: "C",
    timeLimit: 60,
    dimension: "Analytical Processing - Information Evaluation",
    frameworkAlignment: "P21 Critical Thinking; Workplace Cognitive Assessment",
    cognitiveProcess: "Multi-criteria evaluation, information filtering"
  },
  {
    questionNumber: 10,
    section: "Logical Deduction and Critical Thinking",
    questionText: "A manufacturing plant has experienced a 15% decrease in production output over the past month. The following events occurred during this period:\n- Three experienced employees retired\n- A new production software was implemented\n- There was a two-day power outage\n- Raw material costs increased by 5%\n- A minor equipment malfunction occurred in week 2\n\nWhich factor most likely had the greatest impact on the decreased production?",
    options: [
      { letter: "A", text: "Employee retirements" },
      { letter: "B", text: "New production software implementation" },
      { letter: "C", text: "Power outage" },
      { letter: "D", text: "Increased raw material costs" }
    ],
    correctAnswer: "C",
    timeLimit: 60,
    dimension: "Analytical Processing - Causal Analysis",
    frameworkAlignment: "ISTE Systems Thinking; P21 Critical Thinking",
    cognitiveProcess: "Causal reasoning, impact assessment"
  },
  // Section 3: Strategic Planning and Resource Allocation
  {
    questionNumber: 11,
    section: "Strategic Planning and Resource Allocation",
    questionText: "You are managing a project with a budget of $50,000 and a timeline of 6 months. You need to allocate resources to three critical tasks:\n\nTask A: Requires $20,000 and 3 months, generates $35,000 in value\nTask B: Requires $15,000 and 2 months, generates $25,000 in value\nTask C: Requires $25,000 and 4 months, generates $45,000 in value\nTask D: Requires $10,000 and 3 months, generates $15,000 in value\n\nWhich combination of tasks maximizes value while staying within budget and timeline constraints?",
    options: [
      { letter: "A", text: "Tasks A and B" },
      { letter: "B", text: "Tasks A and D" },
      { letter: "C", text: "Tasks B and C" },
      { letter: "D", text: "Tasks B and D" }
    ],
    correctAnswer: "C",
    timeLimit: 90,
    dimension: "Strategic Planning - Resource Optimization",
    frameworkAlignment: "P21 Problem Solving; Workplace Assessment (Diamond, 2013)",
    cognitiveProcess: "Constraint optimization, value maximization"
  },
  {
    questionNumber: 12,
    section: "Strategic Planning and Resource Allocation",
    questionText: "You need to schedule five tasks (A-E) with the following dependencies:\n- Task B cannot start until Task A is complete\n- Task C cannot start until Task B is complete\n- Tasks D and E can start any time\n- Tasks A, B, and C each take 2 days\n- Tasks D and E each take 3 days\n- You have two team members who can work simultaneously on different tasks\n\nWhat is the minimum number of days needed to complete all tasks?",
    options: [
      { letter: "A", text: "6 days" },
      { letter: "B", text: "7 days" },
      { letter: "C", text: "8 days" },
      { letter: "D", text: "9 days" }
    ],
    correctAnswer: "B",
    timeLimit: 90,
    dimension: "Strategic Planning - Scheduling",
    frameworkAlignment: "PISA Planning and Executing; Workplace Assessment",
    cognitiveProcess: "Critical path analysis, parallel processing optimization"
  },
  {
    questionNumber: 13,
    section: "Strategic Planning and Resource Allocation",
    questionText: "A software development team is planning a product launch with the following risks identified:\n\nRisk 1: Technical bug (40% probability, high impact)\nRisk 2: Competitor launches similar product (30% probability, medium impact)\nRisk 3: Key team member leaves (20% probability, medium impact)\nRisk 4: Supplier delay (60% probability, low impact)\n\nWhich risk should be prioritized for mitigation?",
    options: [
      { letter: "A", text: "Risk 1" },
      { letter: "B", text: "Risk 2" },
      { letter: "C", text: "Risk 3" },
      { letter: "D", text: "Risk 4" }
    ],
    correctAnswer: "A",
    timeLimit: 60,
    dimension: "Strategic Planning - Risk Management",
    frameworkAlignment: "P21 Problem Solving; Workplace Assessment",
    cognitiveProcess: "Risk prioritization, impact-probability analysis"
  },
  {
    questionNumber: 14,
    section: "Strategic Planning and Resource Allocation",
    questionText: "A company is deciding between four strategic initiatives. Each initiative has different projected outcomes for market share growth, revenue increase, and customer satisfaction improvement over the next year:\n\nInitiative A: 5% market share growth, 10% revenue increase, 15% customer satisfaction improvement\nInitiative B: 8% market share growth, 7% revenue increase, 5% customer satisfaction improvement\nInitiative C: 3% market share growth, 15% revenue increase, 8% customer satisfaction improvement\nInitiative D: 6% market share growth, 8% revenue increase, 12% customer satisfaction improvement\n\nIf the company's primary goal is balanced growth across all three metrics, which initiative should they choose?",
    options: [
      { letter: "A", text: "Initiative A" },
      { letter: "B", text: "Initiative B" },
      { letter: "C", text: "Initiative C" },
      { letter: "D", text: "Initiative D" }
    ],
    correctAnswer: "D",
    timeLimit: 90,
    dimension: "Strategic Planning - Multi-criteria Decision Making",
    frameworkAlignment: "P21 Critical Thinking; ATC21S Ways of Thinking",
    cognitiveProcess: "Multi-criteria evaluation, balanced optimization"
  },
  {
    questionNumber: 15,
    section: "Strategic Planning and Resource Allocation",
    questionText: "A hospital emergency department has the following patients waiting for treatment:\n\nPatient 1: Severe chest pain, 65 years old, arrived 10 minutes ago\nPatient 2: Minor cut requiring stitches, 25 years old, arrived 45 minutes ago\nPatient 3: High fever and disorientation, 78 years old, arrived 20 minutes ago\nPatient 4: Broken arm, 12 years old, arrived 30 minutes ago\nPatient 5: Difficulty breathing, 45 years old, arrived 5 minutes ago\n\nIf only one doctor is available, which patient should be treated first?",
    options: [
      { letter: "A", text: "Patient 1" },
      { letter: "B", text: "Patient 2" },
      { letter: "C", text: "Patient 3" },
      { letter: "D", text: "Patient 4" },
      { letter: "E", text: "Patient 5" }
    ],
    correctAnswer: "A",
    timeLimit: 60,
    dimension: "Strategic Planning - Prioritization",
    frameworkAlignment: "PISA Planning and Executing; Workplace Assessment",
    cognitiveProcess: "Triage decision making, urgency assessment"
  },
  {
    questionNumber: 16,
    section: "Adaptive Thinking and Flexibility",
    questionText: "You are solving a number sequence puzzle where the rule changes after every three numbers. Identify the next number in the sequence:\n\n2, 4, 6, 9, 12, 15, 8, 16, 24, ?",
    options: [
      { letter: "A", text: "27" },
      { letter: "B", text: "32" },
      { letter: "C", text: "36" },
      { letter: "D", text: "48" }
    ],
    correctAnswer: "B",
    timeLimit: 90,
    dimension: "Adaptive Thinking - Rule Switching",
    frameworkAlignment: "PISA Monitoring and Reflecting; Ionescu (2012)",
    cognitiveProcess: "Rule detection, cognitive flexibility, adaptation"
  },
  {
    questionNumber: 17,
    section: "Adaptive Thinking and Flexibility",
    questionText: "You are planning a delivery route through 5 locations (A-E). Initially, the time (in minutes) to travel between locations is:\nA→B: 10, A→C: 15, A→D: 20, A→E: 25\nB→C: 10, B→D: 15, B→E: 20\nC→D: 10, C→E: 15\nD→E: 10\n\nAfter visiting location B, you learn that:\n- The road from C to D is closed\n- The time from B to E has increased to 35 minutes\n- The time from C to E has increased to 25 minutes\n\nWhat is the most efficient route to visit all locations once, starting at A and ending at E?",
    options: [
      { letter: "A", text: "A→B→C→D→E" },
      { letter: "B", text: "A→B→D→C→E" },
      { letter: "C", text: "A→D→B→C→E" },
      { letter: "D", text: "A→C→B→D→E" }
    ],
    correctAnswer: "B",
    timeLimit: 90,
    dimension: "Adaptive Thinking - Dynamic Planning",
    frameworkAlignment: "PISA Monitoring and Reflecting; Funke (2010)",
    cognitiveProcess: "Route recalculation, adaptive planning"
  },
  {
    questionNumber: 18,
    section: "Adaptive Thinking and Flexibility",
    questionText: "You are playing a game where you need to maximize points by selecting cards. Initially, red cards are worth 5 points and black cards are worth 3 points. After 5 rounds, the values switch: red cards become worth 2 points and black cards become worth 6 points.\n\nIf you can select 8 cards total and must select at least 2 cards of each color, how many red cards should you select to maximize your points?",
    options: [
      { letter: "A", text: "2 red cards" },
      { letter: "B", text: "3 red cards" },
      { letter: "C", text: "5 red cards" },
      { letter: "D", text: "6 red cards" }
    ],
    correctAnswer: "C",
    timeLimit: 60,
    dimension: "Adaptive Thinking - Strategy Optimization",
    frameworkAlignment: "PISA Planning and Executing; ATC21S Ways of Thinking",
    cognitiveProcess: "Value optimization, strategy adaptation"
  },
  {
    questionNumber: 19,
    section: "Adaptive Thinking and Flexibility",
    questionText: "You are organizing a conference with 5 speakers (A-E), each needing a 1-hour slot. Your initial schedule is:\n9:00-10:00: Speaker A\n10:00-11:00: Speaker B\n11:00-12:00: Speaker C\n1:00-2:00: Speaker D\n2:00-3:00: Speaker E\n\nJust before the conference, you learn that:\n- Speaker B can only present in the afternoon\n- Speaker E needs to leave by 1:30 PM\n- Speakers C and D cannot present in consecutive slots\n\nHow should you rearrange the schedule?",
    options: [
      { letter: "A", text: "A, C, E, B, D" },
      { letter: "B", text: "A, E, C, B, D" },
      { letter: "C", text: "C, A, E, B, D" },
      { letter: "D", text: "E, A, C, B, D" }
    ],
    correctAnswer: "B",
    timeLimit: 90,
    dimension: "Adaptive Thinking - Constraint Adaptation",
    frameworkAlignment: "PISA Monitoring and Reflecting; P21 Problem Solving",
    cognitiveProcess: "Schedule reorganization, constraint satisfaction"
  },
  {
    questionNumber: 20,
    section: "Adaptive Thinking and Flexibility",
    questionText: "You are monitoring a system with five metrics (A-E) that typically show the following patterns:\n- Metric A: Steady increase throughout the day\n- Metric B: Peaks at mid-day\n- Metric C: Inversely correlated with Metric A\n- Metric D: Fluctuates randomly\n- Metric E: Remains relatively constant\n\nYou observe that Metric A suddenly drops while Metric C also drops. What is the most likely explanation?",
    options: [
      { letter: "A", text: "Normal system behavior" },
      { letter: "B", text: "Sensor malfunction" },
      { letter: "C", text: "External interference" },
      { letter: "D", text: "System recalibration" }
    ],
    correctAnswer: "B",
    timeLimit: 60,
    dimension: "Adaptive Thinking - Anomaly Detection",
    frameworkAlignment: "ISTE Systems Thinking; Workplace Assessment",
    cognitiveProcess: "Pattern violation detection, causal reasoning"
  },
  // Section 5: Systems Thinking and Complex Problem Solving
  {
    questionNumber: 21,
    section: "Systems Thinking and Complex Problem Solving",
    questionText: "A manufacturing company is experiencing increasing customer complaints about product quality. Investigation reveals the following issues:\n- 15% increase in defect rate over 3 months\n- New suppliers for two components started 4 months ago\n- Staff turnover increased by 10% in the last 6 months\n- Quality control process was automated 2 months ago\n- Production speed was increased by 5% last month\n\nWhat is most likely the root cause of the quality issues?",
    options: [
      { letter: "A", text: "Increased production speed" },
      { letter: "B", text: "New suppliers" },
      { letter: "C", text: "Staff turnover" },
      { letter: "D", text: "Automated quality control" }
    ],
    correctAnswer: "B",
    timeLimit: 90,
    dimension: "Systems Thinking - Root Cause Identification",
    frameworkAlignment: "ISTE Systems Thinking; P21 Problem Solving",
    cognitiveProcess: "Temporal analysis, causal chain identification"
  },
  {
    questionNumber: 22,
    section: "Systems Thinking and Complex Problem Solving",
    questionText: "In a business system, the following relationships exist:\n- When marketing spending increases, customer awareness increases\n- When customer awareness increases, sales increase\n- When sales increase, revenue increases\n- When revenue increases, marketing budget increases\n\nThis system contains what type of feedback loop?",
    options: [
      { letter: "A", text: "Negative feedback loop" },
      { letter: "B", text: "Positive feedback loop" },
      { letter: "C", text: "Neutral feedback loop" },
      { letter: "D", text: "No feedback loop" }
    ],
    correctAnswer: "B",
    timeLimit: 60,
    dimension: "Systems Thinking - Feedback Analysis",
    frameworkAlignment: "ISTE Systems Thinking; Sweller (2011)",
    cognitiveProcess: "System dynamics identification, loop classification"
  },
  {
    questionNumber: 23,
    section: "Systems Thinking and Complex Problem Solving",
    questionText: "A city implements a congestion charge to reduce traffic in the downtown area. Which of the following is the most likely unintended consequence?",
    options: [
      { letter: "A", text: "Reduced air pollution in the downtown area" },
      { letter: "B", text: "Increased property values in the downtown area" },
      { letter: "C", text: "Increased traffic in areas just outside the charging zone" },
      { letter: "D", text: "Reduced business for downtown restaurants" }
    ],
    correctAnswer: "C",
    timeLimit: 90,
    dimension: "Systems Thinking - Secondary Effects",
    frameworkAlignment: "ISTE Systems Thinking; ATC21S Ways of Thinking",
    cognitiveProcess: "Second-order effect prediction, system boundary analysis"
  },
  {
    questionNumber: 24,
    section: "Systems Thinking and Complex Problem Solving",
    questionText: "A hospital emergency department has the following process:\n1. Patient registration (5 minutes)\n2. Initial assessment by nurse (10 minutes)\n3. Waiting for doctor (variable time)\n4. Doctor examination (15 minutes)\n5. Treatment or discharge (variable time)\n\nThe department has 3 registration staff, 5 nurses, and 4 doctors. Where is the bottleneck in this system?",
    options: [
      { letter: "A", text: "Patient registration" },
      { letter: "B", text: "Initial assessment by nurse" },
      { letter: "C", text: "Waiting for doctor" },
      { letter: "D", text: "Doctor examination" }
    ],
    correctAnswer: "C",
    timeLimit: 90,
    dimension: "Systems Thinking - Bottleneck Analysis",
    frameworkAlignment: "PISA Planning and Executing; P21 Problem Solving",
    cognitiveProcess: "Process flow analysis, constraint identification"
  },
  {
    questionNumber: 25,
    section: "Systems Thinking and Complex Problem Solving",
    questionText: "A company's customer service department is experiencing longer call wait times. Analysis shows:\n- Call volume increased by 10%\n- Average call duration increased by 15%\n- Staff size remained the same\n- New product launched last month\n- Website was redesigned two months ago\n\nWhich two factors are most likely connected as cause and effect?",
    options: [
      { letter: "A", text: "Call volume increase and staff size" },
      { letter: "B", text: "New product launch and call duration increase" },
      { letter: "C", text: "Website redesign and call volume increase" },
      { letter: "D", text: "Staff size and call duration increase" }
    ],
    correctAnswer: "B",
    timeLimit: 60,
    dimension: "Systems Thinking - Causal Connections",
    frameworkAlignment: "ISTE Systems Thinking; ATC21S Ways of Thinking",
    cognitiveProcess: "Causal relationship identification, system interaction analysis"
  },
  // Section 6: Data Interpretation and Analysis
  {
    questionNumber: 26,
    section: "Data Interpretation and Analysis",
    questionText: "The graph below shows monthly sales for a company over the past year. Which statement is most accurate based on the data?\n\n[Graph showing monthly sales with seasonal patterns and an overall upward trend]",
    options: [
      { letter: "A", text: "Sales consistently increased every month" },
      { letter: "B", text: "The highest sales occurred in December" },
      { letter: "C", text: "There is a seasonal pattern with peaks every three months" },
      { letter: "D", text: "The overall trend shows approximately 15% annual growth" }
    ],
    correctAnswer: "D",
    timeLimit: 60,
    dimension: "Analytical Processing - Data Analysis",
    frameworkAlignment: "PISA Exploring and Understanding; Workplace Assessment",
    cognitiveProcess: "Trend identification, data pattern recognition"
  },
  {
    questionNumber: 27,
    section: "Data Interpretation and Analysis",
    questionText: "The table below shows performance metrics for four retail stores:\n\n| Store | Sales ($K) | Profit Margin | Customer Satisfaction | Staff Turnover |\n|-------|------------|---------------|----------------------|----------------|\n| A     | 520        | 12%           | 4.2/5                | 15%            |\n| B     | 480        | 15%           | 3.8/5                | 20%            |\n| C     | 610        | 10%           | 4.5/5                | 10%            |\n| D     | 550        | 13%           | 4.0/5                | 25%            |\n\nWhich store is performing best overall?",
    options: [
      { letter: "A", text: "Store A" },
      { letter: "B", text: "Store B" },
      { letter: "C", text: "Store C" },
      { letter: "D", text: "Store D" }
    ],
    correctAnswer: "C",
    timeLimit: 90,
    dimension: "Analytical Processing - Multi-criteria Evaluation",
    frameworkAlignment: "PISA Exploring and Understanding; P21 Critical Thinking",
    cognitiveProcess: "Multi-dimensional data comparison, holistic evaluation"
  },
  {
    questionNumber: 28,
    section: "Data Interpretation and Analysis",
    questionText: "A company tested two marketing campaigns:\n- Campaign A: Shown to 1,000 people, generated 120 sales\n- Campaign B: Shown to 500 people, generated 70 sales\n\nWhich campaign had the better conversion rate?",
    options: [
      { letter: "A", text: "Campaign A" },
      { letter: "B", text: "Campaign B" },
      { letter: "C", text: "Both campaigns had equal conversion rates" },
      { letter: "D", text: "Cannot be determined from the information given" }
    ],
    correctAnswer: "B",
    timeLimit: 60,
    dimension: "Analytical Processing - Quantitative Reasoning",
    frameworkAlignment: "PISA Representing and Formulating; Workplace Assessment",
    cognitiveProcess: "Rate calculation, proportional comparison"
  },
  {
    questionNumber: 29,
    section: "Data Interpretation and Analysis",
    questionText: "A product manager is deciding which feature to develop next based on the following data:\n\n| Feature | Development Time | Customer Demand | Revenue Impact | Technical Risk |\n|---------|------------------|-----------------|----------------|----------------|\n| A       | 3 months         | High            | Medium         | Low            |\n| B       | 1 month          | Medium          | Low            | Low            |\n| C       | 2 months         | Medium          | High           | Medium         |\n| D       | 4 months         | Very High       | Very High      | High           |\n\nIf the company prioritizes revenue impact but needs to minimize technical risk, which feature should be developed next?",
    options: [
      { letter: "A", text: "Feature A" },
      { letter: "B", text: "Feature B" },
      { letter: "C", text: "Feature C" },
      { letter: "D", text: "Feature D" }
    ],
    correctAnswer: "C",
    timeLimit: 90,
    dimension: "Strategic Planning - Decision Making",
    frameworkAlignment: "P21 Critical Thinking; ATC21S Ways of Thinking",
    cognitiveProcess: "Multi-criteria decision making, trade-off analysis"
  },
  {
    questionNumber: 30,
    section: "Data Interpretation and Analysis",
    questionText: "A company is analyzing customer feedback from multiple sources:\n- Survey results show 75% satisfaction with product quality\n- Social media sentiment is 60% positive\n- Customer service receives complaints from 15% of customers\n- Return rate is 8%\n- Repeat purchase rate is 65%\n\nWhat is the most accurate conclusion about customer satisfaction?",
    options: [
      { letter: "A", text: "Customer satisfaction is very high" },
      { letter: "B", text: "Customer satisfaction is moderately high with some areas for improvement" },
      { letter: "C", text: "Customer satisfaction is average" },
      { letter: "D", text: "Customer satisfaction is below industry standards" }
    ],
    correctAnswer: "B",
    timeLimit: 60,
    dimension: "Analytical Processing - Information Synthesis",
    frameworkAlignment: "PISA Monitoring and Reflecting; P21 Critical Thinking",
    cognitiveProcess: "Multi-source data integration, balanced conclusion formation"
  },
  // Section 7: Creative Problem Solving
  {
    questionNumber: 31,
    section: "Creative Problem Solving",
    questionText: "A company needs to reduce paper waste in their office. Beyond recycling, which solution demonstrates the most innovative approach?",
    options: [
      { letter: "A", text: "Implement a paperless policy for all internal communications" },
      { letter: "B", text: "Use paper waste to create notepads for employees" },
      { letter: "C", text: "Create an art competition using paper waste as the primary material" },
      { letter: "D", text: "Develop a composting system that converts paper waste into soil for office plants" }
    ],
    correctAnswer: "D",
    timeLimit: 60,
    dimension: "Creative Thinking - Innovative Solutions",
    frameworkAlignment: "P21 Creativity and Innovation; ATC21S Ways of Thinking",
    cognitiveProcess: "Divergent thinking, repurposing, circular solution development"
  },
  {
    questionNumber: 32,
    section: "Creative Problem Solving",
    questionText: "A software company is experiencing low user engagement with their new app. Traditional approaches have focused on improving features and marketing. Which alternative perspective might yield the most insightful solution?",
    options: [
      { letter: "A", text: "Analyze competitors' apps to identify differentiating features" },
      { letter: "B", text: "Examine how users' physical environment affects app usage" },
      { letter: "C", text: "Survey users about what features they want added" },
      { letter: "D", text: "Increase marketing budget to raise awareness" }
    ],
    correctAnswer: "B",
    timeLimit: 90,
    dimension: "Creative Thinking - Perspective Shifting",
    frameworkAlignment: "P21 Creativity and Innovation; ATC21S Ways of Thinking",
    cognitiveProcess: "Frame shifting, contextual analysis, novel perspective adoption"
  },
  {
    questionNumber: 33,
    section: "Creative Problem Solving",
    questionText: "A small restaurant with limited seating capacity needs to increase revenue during peak hours. Given the physical constraint of space, which solution most creatively reframes the problem?",
    options: [
      { letter: "A", text: "Increase prices during peak hours" },
      { letter: "B", text: "Implement a reservation system with time limits" },
      { letter: "C", text: "Create a premium \"chef's table\" experience at higher prices" },
      { letter: "D", text: "Develop a rotating shared-table concept where strangers dine together" }
    ],
    correctAnswer: "D",
    timeLimit: 60,
    dimension: "Creative Thinking - Constraint Reframing",
    frameworkAlignment: "P21 Creativity and Innovation; ATC21S Ways of Thinking",
    cognitiveProcess: "Constraint reframing, opportunity identification, social innovation"
  },
  {
    questionNumber: 34,
    section: "Creative Problem Solving",
    questionText: "A city faces three challenges: unemployment among youth, isolation among elderly residents, and insufficient green spaces. Which solution most effectively addresses multiple challenges simultaneously?",
    options: [
      { letter: "A", text: "Create a youth employment program focused on building and maintaining urban gardens" },
      { letter: "B", text: "Develop a mentorship program where elderly residents teach skills to unemployed youth" },
      { letter: "C", text: "Create an intergenerational program where youth and elderly work together to build and maintain community gardens" },
      { letter: "D", text: "Establish a training program for youth in green space management" }
    ],
    correctAnswer: "C",
    timeLimit: 90,
    dimension: "Creative Thinking - Integrative Solutions",
    frameworkAlignment: "ISTE Systems Thinking; P21 Creativity and Innovation",
    cognitiveProcess: "Integrative thinking, synergy identification, multi-problem solving"
  },
  {
    questionNumber: 35,
    section: "Creative Problem Solving",
    questionText: "A software development team is struggling with communication issues between developers and the quality assurance team. Which analogical solution might provide the most useful insights?",
    options: [
      { letter: "A", text: "Implement a formal documentation system based on legal contracts" },
      { letter: "B", text: "Adopt pair programming where developers and QA work together" },
      { letter: "C", text: "Study how surgical teams communicate during operations for inspiration" },
      { letter: "D", text: "Create a hierarchical approval system for all code changes" }
    ],
    correctAnswer: "C",
    timeLimit: 60,
    dimension: "Creative Thinking - Analogical Reasoning",
    frameworkAlignment: "P21 Creativity and Innovation; ATC21S Ways of Thinking",
    cognitiveProcess: "Cross-domain application, analogical transfer, inspiration seeking"
  },
  // Section 8: Decision Making Under Pressure
  {
    questionNumber: 36,
    section: "Decision Making Under Pressure",
    questionText: "You are a project manager. Your team has just discovered a critical bug in your software one day before launch. You have the following options:",
    options: [
      { letter: "A", text: "Delay the launch to fix the bug properly" },
      { letter: "B", text: "Launch on time with the bug and issue a patch next week" },
      { letter: "C", text: "Work overnight to implement a partial fix" },
      { letter: "D", text: "Launch only the features unaffected by the bug" }
    ],
    correctAnswer: "A",
    timeLimit: 30,
    dimension: "Decision Making Under Pressure - Risk Assessment",
    frameworkAlignment: "PISA Planning and Executing; Workplace Assessment",
    cognitiveProcess: "Rapid risk assessment, priority determination, consequence evaluation"
  },
  {
    questionNumber: 37,
    section: "Decision Making Under Pressure",
    questionText: "You are an investment manager who must immediately allocate $1 million across four investment options. You have the following partial information:\n- Option A: Historical return of 8%, risk level unknown\n- Option B: Risk level medium, historical return unknown\n- Option C: Historical return of 6%, low risk\n- Option D: Historical return of 12%, high risk\n\nHow should you allocate the funds?",
    options: [
      { letter: "A", text: "100% to Option A" },
      { letter: "B", text: "100% to Option D" },
      { letter: "C", text: "50% to Option C, 50% to Option D" },
      { letter: "D", text: "70% to Option C, 30% to Option D" }
    ],
    correctAnswer: "C",
    timeLimit: 45,
    dimension: "Decision Making Under Pressure - Uncertainty Management",
    frameworkAlignment: "P21 Critical Thinking; Workplace Assessment",
    cognitiveProcess: "Decision making with incomplete information, risk-return balancing"
  },
  {
    questionNumber: 38,
    section: "Decision Making Under Pressure",
    questionText: "You are managing an IT support team. The following critical issues have just been reported simultaneously:\n- Company website is down (affects all customers)\n- CEO's email isn't working (affects executive communication)\n- Accounting system error (affects end-of-month processing)\n- Data center temperature rising (potential hardware damage)\n\nWhich issue should you address first?",
    options: [
      { letter: "A", text: "Company website" },
      { letter: "B", text: "CEO's email" },
      { letter: "C", text: "Accounting system" },
      { letter: "D", text: "Data center temperature" }
    ],
    correctAnswer: "D",
    timeLimit: 30,
    dimension: "Decision Making Under Pressure - Emergency Prioritization",
    frameworkAlignment: "PISA Planning and Executing; Workplace Assessment",
    cognitiveProcess: "Rapid impact assessment, cascading failure prevention, priority setting"
  },
  {
    questionNumber: 39,
    section: "Decision Making Under Pressure",
    questionText: "You manage a small team handling customer support. Suddenly, call volume doubles due to a product issue. You have:\n- 5 team members currently working\n- 3 team members who could be called in (1 hour delay)\n- Option to activate automated response system (immediate but impersonal)\n- Option to temporarily shut down email support to focus on calls\n\nWhat is your best immediate action?",
    options: [
      { letter: "A", text: "Call in the 3 additional team members" },
      { letter: "B", text: "Activate the automated response system" },
      { letter: "C", text: "Shut down email support temporarily" },
      { letter: "D", text: "Implement B and C simultaneously" }
    ],
    correctAnswer: "D",
    timeLimit: 45,
    dimension: "Decision Making Under Pressure - Resource Reallocation",
    frameworkAlignment: "PISA Planning and Executing; P21 Problem Solving",
    cognitiveProcess: "Rapid resource optimization, multi-step solution implementation"
  },
  {
    questionNumber: 40,
    section: "Decision Making Under Pressure",
    questionText: "You are a operations manager for a manufacturing plant. A power outage has just occurred, and you have 5 minutes of backup power. Which action should you prioritize?",
    options: [
      { letter: "A", text: "Contact the utility company for restoration timeline" },
      { letter: "B", text: "Safely shut down critical equipment" },
      { letter: "C", text: "Evacuate all personnel" },
      { letter: "D", text: "Switch to generator power" }
    ],
    correctAnswer: "B",
    timeLimit: 30,
    dimension: "Decision Making Under Pressure - Crisis Management",
    frameworkAlignment: "PISA Planning and Executing; Workplace Assessment",
    cognitiveProcess: "Critical priority identification, safety-focused decision making"
  }
];

const populateQuestions = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect('mongodb+srv://edusoft:RALPBedvxKVF0El7@edusoft-cluster.way6fkv.mongodb.net/edusoft?retryWrites=true&w=majority&appName=EduSoft-Cluster', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB');

    // Clear existing problem solving questions
    await ProblemSolvingQuestion.deleteMany({});
    console.log('Cleared existing problem solving questions');

    // Insert new questions
    console.log('Attempting to insert questions:', questions.length);
    const result = await ProblemSolvingQuestion.insertMany(questions);
    console.log('Successfully populated problem solving questions. Count:', result.length);

    // Verify questions were inserted
    const count = await ProblemSolvingQuestion.countDocuments();
    console.log('Total problem solving questions in database:', count);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    if (error.name === 'ValidationError') {
      console.error('Validation error:', error.errors);
    } else {
      console.error('Error populating problem solving questions:', error);
    }
    process.exit(1);
  }
};

populateQuestions(); 