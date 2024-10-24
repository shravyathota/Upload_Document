const express = require("express");
const router = express.Router();
const db = require("./database"); // Ensure this points to your database connection
const mysql = require('mysql');
const multer = require('multer');
const mammoth = require('mammoth');
const upload = multer({ dest: 'uploads/' });


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

router.post('/uploadDocument', upload.single('document'), async (req, res) => {
    try {
        // Log request body and file to debug
        console.log('Incoming request body:', req.body);
        console.log('Incoming file:', req.file);

        const { examId, selectedSubjects } = req.body;

        // Ensure both examId and selectedSubjects are defined
        if (!examId || !selectedSubjects) {
            return res.status(400).send('examId and selectedSubjects are required.');
        }

        // Ensure file is uploaded     
        if (!req.file) {
            return res.status(400).send('Document file is required.');
        }

        const filePath = req.file.path;
        const documentName = req.file.originalname; // Get the original file name

        // Extract text from the Word document using mammoth (if needed)
        const { value: documentText } = await mammoth.extractRawText({ path: filePath });

        // Execute the query using the connection pool
        await db.execute(
            'INSERT INTO documents (subject_id, doc_name) VALUES (?, ?)', 
            [selectedSubjects, documentName] // Insert the exam ID and document name
        );

        // Send a success response
        res.status(200).send('Document uploaded and data saved successfully.');
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).send('Error uploading document.');
    }
});




module.exports = router;
 
 