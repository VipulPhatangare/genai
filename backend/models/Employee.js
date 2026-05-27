const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    // Core identity
    Employee_ID: { type: String, index: true },
    Manager_ID: String,
    Department: { type: String, index: true },
    Job_Title: { type: String, index: true },

    // Performance
    Performance_Rating: { type: Number, index: true },
    performance_group: { type: String, index: true }, // Low / Mid / High (derived)

    // Dates
    Hire_Date: Date,
    Onboarding_Date: Date,
    First_Project_Start_Date: Date,

    // Training & Development
    Training_Program: String,
    Professional_Development_Hours: Number,
    Number_Of_Promotions: Number,
    Highest_Education_Level: String,
    Certifications: String,

    // Compensation
    Annual_Salary_Increase_Percentage: Number,
    Performance_Bonus_Percentage: Number,
    Bonus: Number,

    // Work patterns
    Work_Hours_Per_Week: Number,
    Telecommuting_Days_Per_Week: Number,
    Overtime_Hours_Per_Week: Number,

    // Skill ratings
    Leadership_Qualities_Rating: { type: Number, index: true },
    Technical_Skills_Rating: Number,
    Communication_Skills_Rating: Number,
    Problem_Solving_Skills_Rating: Number,
    Teamwork_Skills_Rating: Number,
    Initiative_Rating: Number,
    Adaptability_Rating: Number,
    Creativity_Rating: Number,
    Strategic_Thinking_Rating: Number,

    // Behavioral
    Conflict_Resolution_Cases: Number,
    Customer_Complaints_Handled: Number,
    Employee_Engagement_Score: Number,
    Innovation_Projects_Involvement: String,
    Innovation_Contributions: String,
    Leadership_Potential: String,

    // Feedback
    Feedback_From_Colleagues: Number,
    Feedback_From_Supervisors: Number,
    Peer_Reviews: Number,
    Customer_Feedback: Number,

    // Attrition
    Employee_Resignation_Status: { type: String, index: true },
    Employee_Work_Life_Balance_Rating: Number,
    Employee_Job_Satisfaction_Score: Number,

    // Career
    Career_Goals_Set: String,
    Career_Goals_Achievement_Status: String,
    Development_Plan_Completion: String,

    // Recruitment
    Hiring_Source: { type: String, index: true },
    Time_to_Hire: Number,
    Hiring_Manager_Satisfaction: Number,
    Recruitment_Cost: Number,

    // Project
    Project_ID: String,
    Project_Type: String,
    Project_Size: String,
    Project_Complexity: String,
    Project_Role: String,
    Project_Outcome: { type: String, index: true },

    // Mentorship
    Mentor_ID: String,
    Mentor_Experience_Level: String,
    Mentor_Rating: Number,
    Mentor_Availability_Hours_Per_Week: Number,
    Mentor_Training_Provided: String,

    // Internship
    Internship_Duration: String,
    Internship_Completion_Status: String,
    Internship_Conversion_Status: String,
    Internship_Evaluation_Score: Number,
    Internship_Goals_Achievement_Status: String,

    // Benefits & compensation
    Employee_Health_Insurance_Coverage: String,
    Employee_Travel_Allowance: String,
    Employee_Stock_Options: String,
    Employee_Compensation_Benefits: String,
    Employee_Savings_Plans: String,
    Employee_Retirement_Benefits: String,
    Employee_Annual_Salary_Adjustment: Number,

    // Training metrics
    Employee_Training_Cost: Number,
    Employee_Training_Evaluation_Score: Number,
    Employee_Training_Participation_Rate: Number,
    Employee_Training_Certification_Status: String,

  },
  {
    strict: false, // allow any extra CSV columns
    timestamps: false,
  }
);

employeeSchema.index({ Performance_Rating: 1, Department: 1 });
employeeSchema.index({ Employee_Resignation_Status: 1, Department: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
