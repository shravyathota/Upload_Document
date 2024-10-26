const express = require("express");
const router = express.Router();
const db = require("./database"); // Ensure this points to your database connection
const mysql = require('mysql');
const multer = require('multer');
const mammoth = require('mammoth');
const upload = multer({ dest: 'uploads/' });
const path = require('path');
const fsPromises = require('fs').promises;
const cheerio = require('cheerio');



router.get('/exams', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM exams');

        res.json(results);
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).send('Error fetching exams');
    }
});


router.get('/exam/:exam_id/subjects', async (req, res) => {
    const exam_id = req.params.exam_id
    try {
        const [results] = await db.query('SELECT * FROM subjects WHERE exam_id = ?', [exam_id]);

        res.json(results);
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).send('Error fetching subjects');
    }
});
// **********************************************************************************************


// Helper function to insert records into the database
async function insertRecord(documents, data) {
    const [result] = await db.query(`INSERT INTO ${documents} SET ?`, data);
    return result.insertId;
}

router.post('/uploadDocument', upload.single('document'), async (req, res) => {
    const outputDir = path.join(__dirname, 'uploads');
    const filePath = req.file.path; // Path of the uploaded file

    try {
        // Ensure the output directory exists
        await fsPromises.mkdir(outputDir, { recursive: true });

        // Convert DOCX to HTML and raw text
        const result = await mammoth.convertToHtml({ path: filePath });
        const htmlContent = result.value;
        const textResult = await mammoth.extractRawText({ path: filePath });
        const textContent = textResult.value;

        // Split the text content into sections
        const textSections = textContent.split('\n\n');
        const { selectedSubjects } = req.body;
        const documentName = req.file.originalname;

        // Insert document details into the "documents" table
        const documentResult = await insertRecord('documents', {
            doc_name: documentName,
            subject_id: selectedSubjects
        });
        const documentId = documentResult;

        // Extract and save images from the HTML content
        const images = [];
        const $ = cheerio.load(htmlContent);
        $('img').each((i, element) => {
            const base64Data = $(element).attr('src').replace(/^data:image\/\w+;base64,/, '');
            if (base64Data) {
                const imageBuffer = Buffer.from(base64Data, 'base64');
                images.push(imageBuffer);
            }
        });

        // Variables for database insertions
        let question_code = '';
        let question_id = 0;
        let solution_id = 0;
        let imageIndex = 0;
        let k = 1; // For image naming

        // Process each section in the text document
        for (let i = 0; i < textSections.length; i++) {
            if (textSections[i].includes('[QID]')) {
                // Insert question code
                question_code = textSections[i].replace('[QID]', '').trim();
                const questionCodeData = {
                    question_code,
                    doc_id: documentId
                };
                await insertRecord('question_code_table', questionCodeData);
            }
            else if (textSections[i].includes('[Q]')) {
                let questionImagePath = '';
                // Insert image if available
                if (imageIndex < images.length) {
                    const imageName = `snapshot_${documentId}_question_${k}.png`;
                    const imagePath = path.join(outputDir, imageName);
                    await fsPromises.writeFile(imagePath, images[imageIndex]);
                    questionImagePath = imageName;
                    imageIndex++;
                    k++;
                }

                // Insert question with question_code
                const questionData = {
                    question_code,
                    question_img: questionImagePath,
                    subject_id: selectedSubjects
                };
                question_id = await insertRecord('questions', questionData);
            }

            else if (textSections[i].includes('[QANS]')) {
                // Insert answer for the question
                const answerText = textSections[i].replace('[QANS]', '').trim();
                const answerData = {
                    answer_text: answerText,
                    question_id: question_id,
                };
                await insertRecord('answers', answerData);
            }

            else if (textSections[i].includes('[QTYPE]')) {
                // Insert question type
                const questionType = textSections[i].replace('[QTYPE]', '').trim();
                const questionTypeData = {
                    type_of_question: questionType,
                };
                await insertRecord('question_type', questionTypeData);
            }

            else if (textSections[i].includes('[QSOL]')) {
                // Handle solution images (QSOL)
                let solutionImagePath = '';
                if (imageIndex < images.length) {
                    const imageName = `snapshot_${documentId}_solution_${k}.png`;
                    const imagePath = path.join(outputDir, imageName);
                    await fsPromises.writeFile(imagePath, images[imageIndex]);
                    solutionImagePath = imageName; // Store the image name
                    imageIndex++;
                    k++;
                }

                // Insert solution data
                const solutionData = {
                    question_id: question_id,
                    solution_img: solutionImagePath,
                    // solution_image_path: solutionImagePath
                };
                solution_id = await insertRecord('solution', solutionData);
            }
            else if (textSections[i].includes('[QVSOL]')) {
                if (solution_id) { // Check if solution_id exists
                    const solution_link = textSections[i].replace('[QVSOL]', '').trim();
                    const videoSolutionData = {
                        solution_id: solution_id,
                        video_solution_link: solution_link
                    };

                    try {
                        await insertRecord('video_solution', videoSolutionData);
                    } catch (error) {
                        console.error("Error inserting video solution:", error);
                    }
                } else {
                    console.error('Solution ID not found for video solution');
                }
            }
        }

        res.send('Document uploaded and processed successfully.');
    } catch (error) {
        console.error('Error during document processing:', error);
        res.status(500).send('Failed to upload and process the document.');
    }
});



router.get('/examDetails', async (req, res) => {
    try {
        const results = await db.query('SELECT * FROM subjects'); // Replace with your actual table
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching exam details:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;

