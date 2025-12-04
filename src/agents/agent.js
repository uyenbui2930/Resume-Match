// CORE AGENT FILE: Combines OpenAI initialization, Document Parsing, and LLM Scoring.
// This design removes the need for a separate 'utils' folder.

const fs = require('fs');
const util = require('util');
require('dotenv').config(); // Load OPENAI_API_KEY from .env

const { OpenAI } = require('openai');
const pdf = require('pdf-parse'); // For PDF parsing
const mammoth = require('mammoth'); // For DOCX parsing

// 1. Initialize OpenAI client with Gemini compatibility settings
const openai = new OpenAI({
    // Use the GEMINI_API_KEY variable from your .env file
    apiKey: process.env.GEMINI_API_KEY, 
    
    // Set the base URL to Google's compatibility endpoint
    baseURL: process.env.GEMINI_BASE_URL, 
}); 

const readFile = util.promisify(fs.readFile);
// Example of how a chat/completion call changes:
async function generateContent(userPrompt) {
    const response = await openai.chat.completions.create({
        // 2. Change the model name from gpt-3.5-turbo/gpt-4 to a Gemini model
        model: "gemini-2.5-flash", 
        
        messages: [
            { role: "system", content: "You are a document summarization assistant." },
            { role: "user", content: userPrompt }
        ],
    });

    return response.choices[0].message.content;
}

// --- DOCUMENT PARSING FUNCTIONS (Previously in 'utils/parser.js') ---

/**
 * Extracts raw text from a DOCX file using mammoth.
 * @param {string} filePath - Path to the .docx file.
 * @returns {Promise<string>} The extracted text.
 */
async function parseDocx(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
}

/**
 * Extracts raw text from a PDF file using pdf-parse.
 * @param {string} filePath - Path to the .pdf file.
 * @returns {Promise<string>} The extracted text.
 */
async function parsePdf(filePath) {
    const dataBuffer = await readFile(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
}

/**
 * Main function to parse a resume file based on its extension.
 * @param {string} filePath - Path to the resume file.
 * @returns {Promise<string>} The extracted text, or null if unsupported.
 */
async function parseResume(filePath) {
    const extension = filePath.split('.').pop().toLowerCase();

    try {
        if (extension === 'docx') {
            console.log(`Parsing DOCX: ${filePath}`);
            return await parseDocx(filePath);
        } else if (extension === 'pdf') {
            console.log(`Parsing PDF: ${filePath}`);
            return await parsePdf(filePath);
        } else {
            console.warn(`Unsupported file type: ${extension}`);
            return null;
        }
    } catch (error) {
        console.error(`Error during file parsing for ${filePath}:`, error.message);
        throw new Error(`Failed to parse file: ${filePath}`);
    }
}


// --- LLM SCORING AGENT FUNCTION ---

/**
 * Uses an LLM to score a resume against a job description.
 * @param {string} resumePath - Local path to the resume file.
 * @param {string} jobDescription - Text of the job description.
 * @returns {Promise<object>} A JSON object containing the score and feedback.
 */
async function scoreResumeAgent(resumePath, jobDescription) {
    // 1. Get raw text from the resume using the local function
    const resumeText = await parseResume(resumePath);
    if (!resumeText) {
        return { error: 'Could not extract text from resume file.' };
    }

    // 2. Define the Agent's Persona and Task (System Prompt)
    const systemPrompt = `
        You are an **Expert ATS and Senior Technical Recruiter**. 
        Your task is to analyze the candidate's resume against the provided job description.
        You must only return a single, valid JSON object that strictly adheres to the schema.
    `;

    // 3. Define the detailed task and structured output request (User Prompt)
    const userPrompt = `
        **JOB DESCRIPTION (JD):**
        ---
        ${jobDescription}
        ---

        **CANDIDATE RESUME TEXT:**
        ---
        ${resumeText}
        ---

        **Your Scoring Criteria and Output Format:**
        1. **overall_score (Integer 0-100):** The numerical fit score.
        2. **strengths (Array of Strings):** 3-5 specific points where the resume excels (e.g., 'Direct experience with React and Tailwind CSS').
        3. **gaps (Array of Strings):** 3-5 specific skills/experiences from the JD that are missing or weak on the resume (e.g., 'Lacks experience in cloud deployment/AWS').
        4. **summary (String):** A brief, 3-sentence summary of the candidate's fit.

        **Example JSON Output (Must adhere to this structure):**
        {
          "overall_score": 78,
          "strengths": ["...", "..."],
          "gaps": ["...", "..."],
          "summary": "..."
        }
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gemini-2.5-flash", // Cost-effective and highly capable
            messages: [
                { "role": "system", "content": systemPrompt },
                { "role": "user", "content": userPrompt }
            ],
            response_format: { type: "json_object" } 
        });

        const jsonString = response.choices[0].message.content;
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        return { error: `LLM scoring failed: ${error.message}` };
    }
}


// Export the main function and run the test if this file is executed directly.
module.exports = { scoreResumeAgent };


// --- Local Test Execution (kept for convenience) ---
async function runTest() {
    // --- IMPORTANT: CHANGE THESE INPUTS ---
    const testJobDesc = "Seeking a Node.js Backend Developer with 5+ years of experience, specializing in Express.js, MongoDB, and CI/CD pipelines (GitHub Actions).";
    // NOTE: Update this path to your actual resume file!
    const testResumePath = './sample-resume.pdf'; 
    // ----------------------------------------

    console.log(`\n--- Running Resume Scorer for: ${testResumePath} ---`);
    
    const scoreResult = await scoreResumeAgent(testResumePath, testJobDesc);
    
    console.log('\n--- SCORER OUTPUT ---');
    console.log(JSON.stringify(scoreResult, null, 2));
    console.log('---------------------\n');
}

// Uncomment this line to enable local testing via "node src/agent/agent.js"
// runTest();
