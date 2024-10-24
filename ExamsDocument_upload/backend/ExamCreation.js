const express = require("express");
const router = express.Router();
const db = require("./database"); // Ensure this points to your database connection
 
 
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




module.exports = router;
 
 