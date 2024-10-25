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
        const [documentResult] = await db.query('INSERT INTO documents SET ?', {
            doc_name: documentName,
            subject_id: selectedSubjects
        });
        const documentId = documentResult.insertId;

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
        let question_code = 0;
        let question_id=0;
        let imageIndex = 0;
        let k = 1; // For image naming

        // Process each section in the text document
        for (let i = 0; i < textSections.length; i++) {
            if (textSections[i].includes('[QID]')) {
                const questionCode = {
                    question_code: textSections[i].replace('[QID]', '').trim(),
                    doc_id:documentId
                };
                question_code = await insertRecord('question_code_table', questionCode);
            }

            // else if (textSections[i].includes('[Q]')) {
            //     if (imageIndex < images.length) {
            //         const imageName = `snapshot_${documentId}_question_${k}.png`;
            //         const imagePath = path.join(outputDir, imageName);
            //         await fsPromises.writeFile(imagePath, images[imageIndex]);
            //         imageIndex++;
            //         k++;
            //     }
            //     const question_img = {
            //         question_code: textSections[i].replace('[QID]', '').trim(),
            //         // question_img: textSections[i].replace('[Q]', '').trim(),
            //         subject_id: selectedSubjects
            //     };
            //     await insertRecord('questions', question_img);
            // }

            else if (textSections[i].includes('[Q]')) {
                const question_text = textSections[i].replace('[Q]', '').trim();
                if (imageIndex < images.length) {
                    const imageName = `snapshot_${documentId}_question_${k}.png`;
                    const imagePath = path.join(outputDir, imageName);
                    await fsPromises.writeFile(imagePath, images[imageIndex]);
                    imageIndex++;
                    k++;
                }
                const question_img = {
                    question_code: question_code, // Link the inserted question code
                    subject_id: selectedSubjects
                };
                question_id = await insertRecord('questions', question_img);
                console.log(`Inserted question: ${question_code}`); // Debug output
            } 

            else if (textSections[i].includes('[QANS]')) {
                const answer_text = {
                    answer_text: textSections[i].replace('[QANS]', '').trim(),
                    question_id: textSections[i].replace('[QID]', '').trim(),
                };
                question_id = await insertRecord('answers', answer_text);

            }

            else if (textSections[i].includes('[QTYPE]')) {
                const type_of_question = {
                    type_of_question: textSections[i].replace('[QTYPE]', '').trim(),
                    // subject_id: selectedSubjects
                };
                type_of_question = await insertRecord('question_type', type_of_question);
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

                const solution = {
                    question_id: question_id,
                    solution_img: textSections[i].replace('[QSOL]', '').trim(),
                    solution_image_path: solutionImagePath // Store image path in the database
                };
                await insertRecord('solution', solution);
            }
        }

        res.send('Document uploaded and processed successfully.');
    } catch (error) {
        console.error('Error during document processing:', error);
        res.status(500).send('Failed to upload and process the document.');
    }
});



module.exports = router;

