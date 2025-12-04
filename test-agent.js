// test-agent.js

// 1. Import the main scoring function from your new agent file
const { scoreResumeAgent } = require('./src/agents/agent');

// 2. Define the sample inputs (This is where you'd mock data or read a sample resume)
// NOTE: You must have a file named 'sample-resume.pdf' or 'sample-resume.docx' 
// in the root directory for this test to run correctly.
const SAMPLE_RESUME_PATH = './sample-resume.pdf'; 

const SAMPLE_JOB_DESCRIPTION = `
    Job Title: Senior Node.js Microservices Developer
    Requirements: 
    1. 5+ years of experience with Express.js and REST API design.
    2. Deep knowledge of NoSQL databases, particularly MongoDB.
    3. Mandatory experience with CI/CD tools (GitHub Actions or Jenkins).
    4. Proven ability to handle high-traffic applications.
`;

/**
 * Main test function to demonstrate the new LLM-powered resume scoring agent.
 */
async function runAgentTest() {
    console.log("--- Starting LLM Resume Scorer Agent Test ---");
    console.log(`Analyzing resume: ${SAMPLE_RESUME_PATH}`);
    
    // Call your imported LLM function with the test data
    const scoreReport = await scoreResumeAgent(
        SAMPLE_RESUME_PATH, 
        SAMPLE_JOB_DESCRIPTION
    );

    // Display the structured output
    console.log('\n======================================');
    console.log('         FINAL SCORE REPORT         ');
    console.log('======================================');
    
    if (scoreReport.error) {
        console.error("Agent failed to produce a score:", scoreReport.error);
    } else {
        console.log(`Overall Fit Score: ${scoreReport.overall_score}/100`);
        console.log('\nStrengths:');
        scoreReport.strengths.forEach(s => console.log(` - ${s}`));
        
        console.log('\nGaps:');
        scoreReport.gaps.forEach(g => console.log(` - ${g}`));
        
        console.log(`\nSummary: ${scoreReport.summary}`);
    }
    console.log('======================================\n');
}

// Execute the test function
runAgentTest();
