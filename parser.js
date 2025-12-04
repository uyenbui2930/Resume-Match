// utils/parser.js
const fs = require('fs');
const util = require('util');
const pdf = require('pdf-parse'); // For PDF
const mammoth = require('mammoth'); // For DOCX

// Convert fs.readFile into a promise-based function
const readFile = util.promisify(fs.readFile);

/**
 * Extracts raw text from a DOCX file.
 * @param {string} filePath - Path to the .docx file.
 * @returns {Promise<string>} The extracted text.
 */
async function parseDocx(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
}

/**
 * Extracts raw text from a PDF file.
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

module.exports = { parseResume };