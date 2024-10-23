const express = require("express");
const router = express.Router();
const db = require("./database"); // Ensure this points to your database connection
 
 
// // Route to fetch all exams
router.get('/exams', async (req, res) => {
    try {
        // Execute the query
        const [results] = await db.query('SELECT * FROM exams');
       
        // Send the results as a JSON response
        res.json(results);  
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).send('Error fetching exams');
    }
});
 
// Route to fetch subjects for a specific exam
router.get('/exam/:exam_id/subjects', async (req, res) => {
    const exam_id = req.params.exam_id
    try {
        // Execute the query
        const [results] = await db.query('SELECT * FROM subjects WHERE exam_id = ?', [exam_id]);
       
        // Send the results as a JSON response
        res.json(results);
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).send('Error fetching subjects');
    }
});
// Fetch selections
// Fetch selections with grouped data for the frontend table
router.get('/selections', async (req, res) => {
    try {
        // Combined query to get exam details along with unique subject IDs and subject names
        const Query = `
            SELECT 
                s.selection_id, 
                e.exam_id, 
                e.exam_name, 
                GROUP_CONCAT(DISTINCT sub.subject_id ORDER BY sub.subject_id SEPARATOR ', ') AS subject_ids, 
                GROUP_CONCAT(DISTINCT sub.subject_name ORDER BY sub.subject_name SEPARATOR ', ') AS subject_names
            FROM selections s
            JOIN exams e ON s.exam_id = e.exam_id
            JOIN subjects sub ON s.subject_id = sub.subject_id
            GROUP BY s.selection_id, e.exam_id
            ORDER BY e.exam_id;
        `;

        // Execute the combined query
        const [results] = await db.query(Query);

        // Create a structured response to avoid duplicate exam names
        const structuredResults = results.reduce((acc, curr) => {
            const existingExam = acc.find(item => item.exam_id === curr.exam_id);
            if (existingExam) {
                existingExam.subject_ids += `, ${curr.subject_ids}`;
                existingExam.subject_names += `, ${curr.subject_names}`;
            } else {
                acc.push({
                    selection_id: curr.selection_id,
                    exam_id: curr.exam_id,
                    exam_name: curr.exam_name,
                    subject_ids: curr.subject_ids,
                    subject_names: curr.subject_names
                });
            }
            return acc;
        }, []);

        // Respond with the structured results
        res.json(structuredResults);
    } catch (error) {
        console.error('Error fetching selections:', error);
        res.status(500).json({ error: 'Failed to fetch selections' });
    }
});

// Route to handle form submission
router.post('/submit-selection', async (req, res) => {
    const { exam_id, selectedsubjects } = req.body;
 
    // Validate input
    if (!exam_id || !selectedsubjects || selectedsubjects.length === 0) {
        return res.status(400).send('Exam and at least one subject must be selected');
    }
 
 
    try {
       
 
        const insertPromises = selectedsubjects.map(async (subject_id) => {
            // Check if the selection already exists
            const [results] = await db.query(
                'SELECT COUNT(*) AS count FROM selections WHERE exam_id = ? AND subject_id = ?',
                [exam_id, subject_id]
            );
 
            if (results[0].count > 0) {
                return `Selection for exam ${exam_id} and subject ${subject_id} already exists`;
            }
 
            // If not exists, proceed with insertion
            await db.query(
                'INSERT INTO selections (exam_id, subject_id) VALUES (?, ?)',
                [exam_id, subject_id]
            );
 
            return `Subject ${subject_id} added successfully`;
        });
 
        const responses = await Promise.all(insertPromises);
        res.status(200).send('Selection saved successfully. ' + responses.join(' '));
    } catch (err) {
        console.error('Error saving selection:', err);
        res.status(500).send('Error saving selection');
    }
});

// Update selections
router.put('/selections/ExamCreation_update/:id', async (req, res) => {
    const { id } = req.params;
    const { exam_id, selectedsubjects } = req.body;
 
    // Validate input
    if (!exam_id || !Array.isArray(selectedsubjects)) {
        return res.status(400).json({ message: 'Invalid input data' });
    }
 
   
 
    try {
        // Delete unchecked subjects
        await db.query('DELETE FROM selections WHERE exam_id = ? AND subject_id NOT IN (?)', [exam_id, selectedsubjects]);
 
        // Insert or update checked subjects
        const insertPromises = selectedsubjects.map(subject_id => {
            return db.query(
                'INSERT INTO selections (exam_id, subject_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE subject_id = VALUES(subject_id)',
                [exam_id, subject_id]
            );
        });
 
        await Promise.all(insertPromises);
        res.json({ message: 'Selection updated successfully' });
    } catch (err) {
        console.error('Error updating selection:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
 
// Route to delete a selection by selection_id
router.delete('/selections/ExamCreation_delete/:exam_id', async (req, res) => {
    const exam_id = req.params.exam_id;
    console.log('Received exam_id for deletion:', exam_id); // Log the ID

    try {
        const [results] = await db.query('DELETE FROM selections WHERE exam_id = ?', [exam_id]);

        console.log('Delete results:', results); // Log results from the delete operation

        if (results.affectedRows === 0) {
            console.log(`No selections found with exam_id: ${exam_id}`);
            return res.status(404).send('Selections not found'); // Handle case where no rows were deleted
        }

        res.status(204).send(); // No content to send back
    } catch (err) {
        console.error('Error deleting selections:', err);
        res.status(500).send('Error deleting selections');
    }
});


 
// Export the router
module.exports = router;
 
 