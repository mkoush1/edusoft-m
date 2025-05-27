import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Define the schema for MCQ questions
const leadershipQuestionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  questionText: { type: String, required: true },
  competency: { type: String, required: true },
  options: [{
    letter: { type: String, required: true },
    text: { type: String, required: true }
  }],
  correctAnswer: { type: String, required: true },
  reasoning: { type: String, required: true }
});

// Check if model exists before creating it
const LeadershipQuestion = mongoose.models.LeadershipQuestion || mongoose.model('LeadershipQuestion', leadershipQuestionSchema);

const leadershipQuestions = [
  {
    questionNumber: 1,
    questionText: "A project update needs to be communicated to the entire team, some of whom are remote. What is the most effective approach to ensure everyone receives and understands the information clearly?",
    competency: "Communication",
    options: [
      { letter: "A", text: "Send a brief email with the key updates." },
      { letter: "B", text: "Schedule a video conference call to discuss the updates and allow for Q&A." },
      { letter: "C", text: "Inform team leads and ask them to cascade the information to their respective team members." },
      { letter: "D", text: "Post the updates on the company intranet and assume everyone will read them." }
    ],
    correctAnswer: "B",
    reasoning: "A video conference allows for direct communication, visual cues, immediate clarification through Q&A, and ensures engagement from both local and remote team members."
  },
  {
    questionNumber: 2,
    questionText: "During a team meeting, a junior member nervously presents an idea that has some flaws but also potential. How should a leader best respond?",
    competency: "Team Management",
    options: [
      { letter: "A", text: "Immediately point out the flaws to save time and prevent the team from pursuing a weak idea." },
      { letter: "B", text: "Thank the team member for their contribution, acknowledge the potential, and then gently guide a discussion around how to address the flaws or build upon the idea." },
      { letter: "C", text: "Ignore the idea and move on to the next agenda item to avoid embarrassing the team member." },
      { letter: "D", text: "Ask a senior team member to critique the idea publicly." }
    ],
    correctAnswer: "B",
    reasoning: "This approach encourages participation, fosters psychological safety, and demonstrates constructive feedback while valuing the contribution."
  },
  {
    questionNumber: 3,
    questionText: "You receive critical feedback from your manager about a recent project you led. What is the most professional and constructive first step to take?",
    competency: "Emotional Intelligence",
    options: [
      { letter: "A", text: "Defend your actions and explain why the feedback is unfair." },
      { letter: "B", text: "Listen actively to the feedback, ask clarifying questions to ensure full understanding, and thank your manager for their input." },
      { letter: "C", text: "Immediately apologize and promise to do better next time without fully understanding the specifics." },
      { letter: "D", text: "Discuss the feedback with your colleagues to see if they agree with the manager." }
    ],
    correctAnswer: "B",
    reasoning: "Active listening and seeking clarification are crucial for understanding feedback. Thanking the manager shows professionalism and openness to development."
  },
  {
    questionNumber: 4,
    questionText: "Your team is facing an unexpected technical issue that is delaying a critical project. Resources are limited. What is the most appropriate initial action for a leader?",
    competency: "Decision Making",
    options: [
      { letter: "A", text: "Immediately escalate the issue to senior management and wait for their direction." },
      { letter: "B", text: "Gather the relevant team members to quickly assess the scope of the problem, identify potential causes, and brainstorm short-term and long-term solutions." },
      { letter: "C", text: "Assign the problem to the most experienced team member and expect them to resolve it independently." },
      { letter: "D", text: "Pause all other team activities until this single issue is fully resolved, regardless of other priorities." }
    ],
    correctAnswer: "B",
    reasoning: "A leader should first facilitate a collaborative problem-assessment and brainstorming session to understand the issue and explore options before escalating or making unilateral decisions."
  },
  {
    questionNumber: 5,
    questionText: "Two key team members have a significant disagreement on the best approach to a critical task, and it's impacting team morale. As the leader, what should you do?",
    competency: "Team Management",
    options: [
      { letter: "A", text: "Pick the approach you think is best and instruct them to follow it." },
      { letter: "B", text: "Tell them to sort it out themselves as they are both professionals." },
      { letter: "C", text: "Facilitate a discussion between them, helping them to explore the pros and cons of each approach and find a mutually acceptable solution or a compromise." },
      { letter: "D", text: "Take a vote from the rest of the team on which approach to use." }
    ],
    correctAnswer: "C",
    reasoning: "Facilitating a constructive discussion helps in resolving the conflict, ensures both perspectives are heard, and aims for a collaborative outcome."
  },
  {
    questionNumber: 6,
    questionText: "A new market opportunity has emerged, but it requires a significant shift in your team's current priorities and a quick decision. What is a crucial first step before making the decision?",
    competency: "Decision Making",
    options: [
      { letter: "A", text: "Make an immediate gut decision to seize the opportunity before competitors do." },
      { letter: "B", text: "Gather as much relevant data as possible about the opportunity, its risks, resource implications, and alignment with strategic goals." },
      { letter: "C", text: "Consult only with your most trusted senior team member to get their opinion quickly." },
      { letter: "D", text: "Announce the new opportunity to the team and ask for volunteers to lead the initiative." }
    ],
    correctAnswer: "B",
    reasoning: "While speed can be important, a crucial first step for a significant strategic decision is to gather relevant data to make an informed choice."
  },
  {
    questionNumber: 7,
    questionText: "A team member seems disengaged and their performance has recently declined. You suspect they might be facing personal challenges. How should a leader with high emotional intelligence approach this?",
    competency: "Emotional Intelligence",
    options: [
      { letter: "A", text: "Publicly address their performance decline in a team meeting to motivate them." },
      { letter: "B", text: "Ignore the situation, assuming they will resolve their personal issues on their own." },
      { letter: "C", text: "Arrange a private and empathetic conversation to express concern, offer support, and understand if there are any workplace factors contributing or how the company can assist." },
      { letter: "D", text: "Immediately start formal disciplinary procedures for their performance decline." }
    ],
    correctAnswer: "C",
    reasoning: "A private, empathetic conversation shows concern and a willingness to support the team member, which is characteristic of high emotional intelligence."
  },
  {
    questionNumber: 8,
    questionText: "Your team has just successfully completed a very challenging project that required long hours and significant effort. What is an important action for a leader to take?",
    competency: "Team Management",
    options: [
      { letter: "A", text: "Immediately assign them the next challenging project to maintain momentum." },
      { letter: "B", text: "Acknowledge their hard work, celebrate the success publicly, and ensure they get appropriate recognition and a chance to recharge." },
      { letter: "C", text: "Provide individual feedback only to those who performed exceptionally, to foster competition." },
      { letter: "D", text: "Assume they are just doing their job and no special acknowledgment is needed." }
    ],
    correctAnswer: "B",
    reasoning: "Recognizing effort and celebrating success is crucial for team morale, motivation, and reinforcing positive behaviors."
  },
  {
    questionNumber: 9,
    questionText: "When delegating a complex task to a team member, what is most important for a leader to do to ensure success?",
    competency: "Team Management",
    options: [
      { letter: "A", text: "Provide vague instructions to encourage the team member's creativity." },
      { letter: "B", text: "Clearly define the desired outcomes, provide necessary resources and authority, and establish check-in points, but allow autonomy in how the task is performed." },
      { letter: "C", text: "Micromanage every step of the process to prevent any mistakes." },
      { letter: "D", text: "Delegate the task and then completely step away, only checking in at the final deadline." }
    ],
    correctAnswer: "B",
    reasoning: "Effective delegation involves providing clarity on goals, resources, and authority, while also empowering the team member with autonomy."
  },
  {
    questionNumber: 10,
    questionText: "A leader notices that a promising junior team member is hesitant to take on more responsibility. What is a good developmental approach?",
    competency: "Development",
    options: [
      { letter: "A", text: "Force them into a high-stakes leadership role to see if they sink or swim." },
      { letter: "B", text: "Gradually assign them tasks with increasing responsibility, providing mentorship, support, and opportunities for small wins to build their confidence." },
      { letter: "C", text: "Conclude they are not ambitious and focus development efforts on other team members." },
      { letter: "D", text: "Publicly praise other team members who are taking on more responsibility to indirectly pressure them." }
    ],
    correctAnswer: "B",
    reasoning: "A gradual, supportive approach with mentorship is the most effective way to develop a team member's confidence and skills."
  },
  {
    questionNumber: 11,
    questionText: "A company is considering entering a new, rapidly evolving market. What is the most critical role of a leader in this situation?",
    competency: "Vision",
    options: [
      { letter: "A", text: "To quickly commit significant resources to gain first-mover advantage, based on initial positive signals." },
      { letter: "B", text: "To conduct thorough market analysis, assess risks and opportunities, align the potential move with the company's long-term vision, and then develop a phased entry strategy." },
      { letter: "C", text: "To wait for competitors to enter the market first and then learn from their successes and failures." },
      { letter: "D", text: "To delegate the entire market entry strategy to a specialized consultant without internal involvement." }
    ],
    correctAnswer: "B",
    reasoning: "Strategic leadership involves careful analysis, risk assessment, and alignment with long-term vision before committing to a significant move."
  },
  {
    questionNumber: 12,
    questionText: "How can a leader best ensure their team understands and is aligned with the company's long-term strategic goals?",
    competency: "Vision",
    options: [
      { letter: "A", text: "By sending out a memo with the strategic goals listed once a year." },
      { letter: "B", text: "By regularly communicating the vision, explaining how individual and team contributions fit into the bigger picture, and linking daily tasks to strategic objectives." },
      { letter: "C", text: "By assuming that senior management has adequately communicated the strategy to everyone." },
      { letter: "D", text: "By focusing the team only on short-term operational targets to avoid overwhelming them with strategy." }
    ],
    correctAnswer: "B",
    reasoning: "Consistent communication, contextualization, and linking daily work to strategic goals are essential for ensuring team alignment."
  },
  {
    questionNumber: 13,
    questionText: "An organization is undergoing a major restructuring. Employees are anxious and resistant to the changes. What is a leader's primary responsibility?",
    competency: "Adaptability",
    options: [
      { letter: "A", text: "To enforce the changes strictly and discipline those who resist." },
      { letter: "B", text: "To communicate transparently about the reasons for the change, listen to employee concerns, involve them in the process where possible, and provide support during the transition." },
      { letter: "C", text: "To shield the team from the details of the restructuring to avoid causing more anxiety." },
      { letter: "D", text: "To agree with the team's resistance and try to halt the restructuring process." }
    ],
    correctAnswer: "B",
    reasoning: "Effective change leadership involves open communication, empathy, involvement, and support to help employees navigate uncertainty."
  },
  {
    questionNumber: 14,
    questionText: "A sudden shift in market demand requires your team to quickly learn new skills and adapt its processes. What approach should a leader take?",
    competency: "Adaptability",
    options: [
      { letter: "A", text: "Demand that team members learn the new skills in their own time without providing resources." },
      { letter: "B", text: "Identify the required skills, provide access to training and resources, encourage a growth mindset, and support the team through the learning curve, acknowledging that there might be initial challenges." },
      { letter: "C", text: "Replace team members who do not already possess the new skills with new hires." },
      { letter: "D", text: "Postpone adapting to the market shift, hoping it is a temporary trend." }
    ],
    correctAnswer: "B",
    reasoning: "Supporting the team through change with resources, training, and a positive mindset is crucial for successful adaptation."
  },
  {
    questionNumber: 15,
    questionText: "A team member approaches you with a concern about a potential ethical issue in a project. What is the most appropriate first response?",
    competency: "Ethics",
    options: [
      { letter: "A", text: "Tell them to handle it themselves since they identified the issue." },
      { letter: "B", text: "Listen carefully to their concerns, gather relevant information, and take the matter seriously by following appropriate reporting procedures." },
      { letter: "C", text: "Dismiss the concern as overly cautious and suggest they focus on meeting project deadlines." },
      { letter: "D", text: "Share the concern with the entire team to get their opinions." }
    ],
    correctAnswer: "B",
    reasoning: "Ethical concerns should be taken seriously, investigated properly, and handled through appropriate channels to maintain integrity."
  },
  {
    questionNumber: 16,
    questionText: "Your team is under pressure to meet a tight deadline, and you discover a potential quality issue. What is the most ethical approach?",
    competency: "Ethics",
    options: [
      { letter: "A", text: "Proceed with the current quality level to meet the deadline, as the issue is minor." },
      { letter: "B", text: "Assess the potential impact of the quality issue, communicate transparently with stakeholders, and work with the team to find a solution that maintains quality standards while minimizing delays." },
      { letter: "C", text: "Blame the team member responsible for the quality issue to protect your reputation." },
      { letter: "D", text: "Ignore the issue and hope it won't be noticed." }
    ],
    correctAnswer: "B",
    reasoning: "Maintaining quality standards while being transparent with stakeholders demonstrates ethical leadership and commitment to excellence."
  },
  {
    questionNumber: 17,
    questionText: "A team member suggests an innovative approach to a recurring problem. What is the best way to handle this suggestion?",
    competency: "Innovation",
    options: [
      { letter: "A", text: "Dismiss it immediately if it's different from the current approach." },
      { letter: "B", text: "Evaluate the suggestion objectively, consider its potential benefits, and if promising, provide resources and support to test and implement it." },
      { letter: "C", text: "Tell them to implement it on their own time if they believe in it so strongly." },
      { letter: "D", text: "Share it with senior management and wait for their decision." }
    ],
    correctAnswer: "B",
    reasoning: "Fostering innovation requires objective evaluation of new ideas and providing support for promising initiatives."
  },
  {
    questionNumber: 18,
    questionText: "Your team is struggling with a complex problem that requires creative thinking. What is the most effective way to encourage innovation?",
    competency: "Innovation",
    options: [
      { letter: "A", text: "Set a strict deadline to force quick solutions." },
      { letter: "B", text: "Create a safe space for brainstorming, encourage diverse perspectives, and allow time for experimentation and iteration." },
      { letter: "C", text: "Assign the problem to the most experienced team member only." },
      { letter: "D", text: "Look for similar problems solved by competitors and copy their approach." }
    ],
    correctAnswer: "B",
    reasoning: "Creating an environment that encourages creative thinking and experimentation is key to fostering innovation."
  },
  {
    questionNumber: 19,
    questionText: "A team member consistently underperforms despite previous feedback. What is the most constructive approach?",
    competency: "Development",
    options: [
      { letter: "A", text: "Document their failures and prepare for termination." },
      { letter: "B", text: "Have a detailed discussion to understand any obstacles they're facing, provide specific feedback, create a development plan with clear goals and timelines, and offer regular support and check-ins." },
      { letter: "C", text: "Transfer them to a different team to avoid dealing with the issue." },
      { letter: "D", text: "Lower your expectations to match their current performance level." }
    ],
    correctAnswer: "B",
    reasoning: "A structured approach to development, with clear goals and support, is most likely to help an underperforming team member improve."
  },
  {
    questionNumber: 20,
    questionText: "You notice that a team member has potential for leadership but lacks confidence. What is the best way to develop their leadership skills?",
    competency: "Development",
    options: [
      { letter: "A", text: "Immediately promote them to a leadership position to build their confidence." },
      { letter: "B", text: "Provide opportunities for them to lead small projects or initiatives, offer mentorship, and give constructive feedback on their leadership approach." },
      { letter: "C", text: "Tell them they need to be more confident before they can be a leader." },
      { letter: "D", text: "Wait until they demonstrate leadership skills on their own." }
    ],
    correctAnswer: "B",
    reasoning: "Gradual exposure to leadership opportunities with support and feedback is the most effective way to develop leadership skills."
  },
  {
    questionNumber: 21,
    questionText: "Your team is working on a project that requires collaboration with another department. What is the most effective way to ensure successful collaboration?",
    competency: "Team Management",
    options: [
      { letter: "A", text: "Work independently and share only the final results." },
      { letter: "B", text: "Establish clear communication channels, set shared goals, define roles and responsibilities, and schedule regular check-ins to ensure alignment." },
      { letter: "C", text: "Let each team handle their part separately and combine the results at the end." },
      { letter: "D", text: "Assign one person to handle all interdepartmental communication." }
    ],
    correctAnswer: "B",
    reasoning: "Clear communication, shared goals, and regular check-ins are essential for successful cross-departmental collaboration."
  },
  {
    questionNumber: 22,
    questionText: "A team member is consistently late to meetings and misses deadlines. What is the most appropriate first step?",
    competency: "Team Management",
    options: [
      { letter: "A", text: "Publicly reprimand them in the next team meeting." },
      { letter: "B", text: "Have a private conversation to understand any underlying issues, discuss the impact of their behavior, and work together to find solutions." },
      { letter: "C", text: "Send them a formal warning email." },
      { letter: "D", text: "Ignore the behavior and hope it improves on its own." }
    ],
    correctAnswer: "B",
    reasoning: "Addressing performance issues privately and understanding the root cause is more effective than public reprimand or formal warnings."
  },
  {
    questionNumber: 23,
    questionText: "Your team is facing a tight deadline and high pressure. What is the most effective way to maintain team morale?",
    competency: "Emotional Intelligence",
    options: [
      { letter: "A", text: "Emphasize the consequences of missing the deadline to motivate the team." },
      { letter: "B", text: "Acknowledge the pressure, maintain open communication, provide support where needed, and celebrate small wins along the way." },
      { letter: "C", text: "Ignore the pressure and focus only on the work." },
      { letter: "D", text: "Promise rewards for meeting the deadline." }
    ],
    correctAnswer: "B",
    reasoning: "Acknowledging pressure and providing support while celebrating progress helps maintain team morale during challenging times."
  },
  {
    questionNumber: 24,
    questionText: "A team member is resistant to a new process that you believe will improve efficiency. What is the best approach?",
    competency: "Adaptability",
    options: [
      { letter: "A", text: "Force them to follow the new process without discussion." },
      { letter: "B", text: "Listen to their concerns, explain the benefits of the new process, provide training and support, and allow time for adjustment." },
      { letter: "C", text: "Exempt them from using the new process." },
      { letter: "D", text: "Wait until they see others using it successfully." }
    ],
    correctAnswer: "B",
    reasoning: "Addressing concerns, providing support, and allowing time for adjustment helps team members adapt to new processes."
  },
  {
    questionNumber: 25,
    questionText: "You need to make a difficult decision that will affect your team. What is the most effective approach?",
    competency: "Decision Making",
    options: [
      { letter: "A", text: "Make the decision quickly to avoid prolonged uncertainty." },
      { letter: "B", text: "Gather relevant information, consider different perspectives, evaluate options, make a decision, and communicate the rationale clearly to the team." },
      { letter: "C", text: "Let the team vote on the decision." },
      { letter: "D", text: "Delay the decision until you're absolutely certain." }
    ],
    correctAnswer: "B",
    reasoning: "A thorough decision-making process that includes gathering information and communicating rationale leads to better outcomes."
  },
  {
    questionNumber: 26,
    questionText: "Your team is working on a project that requires innovative thinking. What is the best way to foster creativity?",
    competency: "Innovation",
    options: [
      { letter: "A", text: "Set strict guidelines to ensure quality." },
      { letter: "B", text: "Create a safe environment for sharing ideas, encourage diverse perspectives, and allow time for experimentation." },
      { letter: "C", text: "Assign the most creative team members to lead the project." },
      { letter: "D", text: "Look for similar projects online and adapt their solutions." }
    ],
    correctAnswer: "B",
    reasoning: "Creating a safe environment for sharing ideas and encouraging diverse perspectives fosters creativity and innovation."
  },
  {
    questionNumber: 27,
    questionText: "A team member has made a significant mistake that affected the project. What is the most constructive response?",
    competency: "Emotional Intelligence",
    options: [
      { letter: "A", text: "Point out the mistake publicly to prevent others from making similar errors." },
      { letter: "B", text: "Address the mistake privately, focus on learning from it, and work together to prevent similar issues in the future." },
      { letter: "C", text: "Ignore the mistake to avoid embarrassing the team member." },
      { letter: "D", text: "Assign them to a different project." }
    ],
    correctAnswer: "B",
    reasoning: "Addressing mistakes privately and focusing on learning helps maintain team morale and prevents future errors."
  },
  {
    questionNumber: 28,
    questionText: "Your team is facing a complex problem that requires multiple perspectives. What is the best way to approach this?",
    competency: "Team Management",
    options: [
      { letter: "A", text: "Solve it yourself to ensure efficiency." },
      { letter: "B", text: "Facilitate a collaborative problem-solving session where team members can share their perspectives and work together to find a solution." },
      { letter: "C", text: "Assign it to the most experienced team member." },
      { letter: "D", text: "Break it into smaller tasks and assign them randomly." }
    ],
    correctAnswer: "B",
    reasoning: "Collaborative problem-solving leverages diverse perspectives and leads to better solutions."
  },
  {
    questionNumber: 29,
    questionText: "A team member is struggling with a task that's outside their comfort zone. What is the most supportive approach?",
    competency: "Development",
    options: [
      { letter: "A", text: "Tell them to figure it out on their own." },
      { letter: "B", text: "Provide guidance and resources, break the task into manageable steps, and offer regular support and feedback." },
      { letter: "C", text: "Assign the task to someone else." },
      { letter: "D", text: "Lower your expectations for their performance." }
    ],
    correctAnswer: "B",
    reasoning: "Providing support and breaking tasks into manageable steps helps team members grow and develop new skills."
  },
  {
    questionNumber: 30,
    questionText: "Your team needs to adapt to a new technology. What is the most effective way to manage this transition?",
    competency: "Adaptability",
    options: [
      { letter: "A", text: "Implement the change immediately to minimize disruption." },
      { letter: "B", text: "Plan the transition, provide training and resources, allow time for practice, and offer support during the learning process." },
      { letter: "C", text: "Let team members learn the technology on their own time." },
      { letter: "D", text: "Hire new team members who already know the technology." }
    ],
    correctAnswer: "B",
    reasoning: "A planned transition with proper training and support helps teams adapt to new technologies effectively."
  },
  {
    questionNumber: 31,
    questionText: "You notice a potential conflict between two team members. What is the best way to handle this?",
    competency: "Team Management",
    options: [
      { letter: "A", text: "Ignore it and hope it resolves itself." },
      { letter: "B", text: "Address the situation early, facilitate a constructive discussion between the team members, and help them find a mutually acceptable solution." },
      { letter: "C", text: "Separate them by assigning them to different projects." },
      { letter: "D", text: "Take sides based on who you think is right." }
    ],
    correctAnswer: "B",
    reasoning: "Addressing conflicts early and facilitating constructive dialogue helps maintain team harmony and productivity."
  },
  {
    questionNumber: 32,
    questionText: "Your team is working on a project with tight deadlines. What is the most effective way to manage time?",
    competency: "Team Management",
    options: [
      { letter: "A", text: "Work longer hours to meet the deadline." },
      { letter: "B", text: "Break the project into manageable tasks, set clear priorities, establish checkpoints, and regularly review progress." },
      { letter: "C", text: "Focus on completing tasks as they come up." },
      { letter: "D", text: "Push back the deadline to ensure quality." }
    ],
    correctAnswer: "B",
    reasoning: "Breaking projects into manageable tasks and setting clear priorities helps teams meet deadlines effectively."
  },
  {
    questionNumber: 33,
    questionText: "A team member has a great idea for improving a process. What is the best way to implement it?",
    competency: "Innovation",
    options: [
      { letter: "A", text: "Implement it immediately to show support." },
      { letter: "B", text: "Evaluate the idea, discuss it with the team, create an implementation plan, and provide necessary resources and support." },
      { letter: "C", text: "Tell them to implement it themselves if they believe in it." },
      { letter: "D", text: "Save it for a future project." }
    ],
    correctAnswer: "B",
    reasoning: "Evaluating ideas and creating a structured implementation plan leads to successful process improvements."
  },
  {
    questionNumber: 34,
    questionText: "Your team is facing a challenging situation that requires quick thinking. What is the most effective approach?",
    competency: "Decision Making",
    options: [
      { letter: "A", text: "Make a quick decision to show leadership." },
      { letter: "B", text: "Assess the situation, consider available options, make a decision based on available information, and communicate the plan clearly to the team." },
      { letter: "C", text: "Wait for more information before deciding." },
      { letter: "D", text: "Let the team decide what to do." }
    ],
    correctAnswer: "B",
    reasoning: "Making informed decisions quickly while communicating clearly helps teams navigate challenging situations effectively."
  },
  {
    questionNumber: 35,
    questionText: "A team member is consistently exceeding expectations. What is the best way to recognize their performance?",
    competency: "Team Management",
    options: [
      { letter: "A", text: "Give them more work to challenge them." },
      { letter: "B", text: "Acknowledge their contributions, provide opportunities for growth, and consider appropriate recognition or rewards." },
      { letter: "C", text: "Expect them to maintain the same high level without additional support." },
      { letter: "D", text: "Keep their performance private to avoid creating competition." }
    ],
    correctAnswer: "B",
    reasoning: "Recognizing high performance and providing growth opportunities helps maintain motivation and engagement."
  },
  {
    questionNumber: 36,
    questionText: "Your team needs to learn a new skill to complete a project. What is the most effective way to facilitate this?",
    competency: "Development",
    options: [
      { letter: "A", text: "Let team members learn on their own time." },
      { letter: "B", text: "Provide structured training, resources, and support, and create opportunities for practice and feedback." },
      { letter: "C", text: "Assign the task to someone who already has the skill." },
      { letter: "D", text: "Simplify the project to avoid learning new skills." }
    ],
    correctAnswer: "B",
    reasoning: "Structured training and support helps teams learn new skills effectively and efficiently."
  },
  {
    questionNumber: 37,
    questionText: "You notice that team communication could be improved. What is the most effective way to address this?",
    competency: "Communication",
    options: [
      { letter: "A", text: "Send more emails to keep everyone informed." },
      { letter: "B", text: "Establish clear communication channels, set expectations for response times, and create opportunities for regular team updates and feedback." },
      { letter: "C", text: "Let team members communicate as they prefer." },
      { letter: "D", text: "Schedule more meetings." }
    ],
    correctAnswer: "B",
    reasoning: "Establishing clear communication channels and expectations improves team communication and collaboration."
  },
  {
    questionNumber: 38,
    questionText: "Your team is working on a project that requires collaboration with external stakeholders. What is the best way to manage this?",
    competency: "Communication",
    options: [
      { letter: "A", text: "Handle all external communication yourself." },
      { letter: "B", text: "Establish clear communication protocols, define roles and responsibilities, and maintain regular updates with all stakeholders." },
      { letter: "C", text: "Let team members communicate with stakeholders as needed." },
      { letter: "D", text: "Minimize external communication to avoid confusion." }
    ],
    correctAnswer: "B",
    reasoning: "Clear communication protocols and regular updates ensure effective collaboration with external stakeholders."
  },
  {
    questionNumber: 39,
    questionText: "A team member is struggling with work-life balance. What is the most supportive approach?",
    competency: "Emotional Intelligence",
    options: [
      { letter: "A", text: "Tell them to manage their time better." },
      { letter: "B", text: "Have a private conversation to understand their situation, discuss flexible work options, and help them find a sustainable balance." },
      { letter: "C", text: "Ignore the issue as it's their personal problem." },
      { letter: "D", text: "Reduce their workload without discussion." }
    ],
    correctAnswer: "B",
    reasoning: "Supporting work-life balance through understanding and flexible options helps maintain team member well-being and productivity."
  },
  {
    questionNumber: 40,
    questionText: "Your team is facing a significant change in project direction. What is the most effective way to manage this transition?",
    competency: "Adaptability",
    options: [
      { letter: "A", text: "Implement the change immediately to minimize disruption." },
      { letter: "B", text: "Communicate the change clearly, explain the reasons, provide necessary support and resources, and help the team adapt to the new direction." },
      { letter: "C", text: "Let team members figure out the changes on their own." },
      { letter: "D", text: "Delay the change until everyone is ready." }
    ],
    correctAnswer: "B",
    reasoning: "Clear communication and support help teams adapt to changes in project direction effectively."
  }
];

const populateQuestions = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edusoft', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB');

    // Clear existing questions
    await LeadershipQuestion.deleteMany({});
    console.log('Cleared existing questions');

    // Insert new questions
    console.log('Attempting to insert questions:', leadershipQuestions.length);
    const result = await LeadershipQuestion.insertMany(leadershipQuestions);
    console.log('Successfully populated leadership questions. Count:', result.length);

    // Verify questions were inserted
    const count = await LeadershipQuestion.countDocuments();
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