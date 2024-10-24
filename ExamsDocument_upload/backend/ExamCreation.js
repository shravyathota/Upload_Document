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

// router.get('/selections', async (req, res) => {
//     try {
//         const Query = `
//             SELECT 
//                 s.selection_id, 
//                 e.exam_id, 
//                 e.exam_name, 
//                 GROUP_CONCAT(DISTINCT sub.subject_id ORDER BY sub.subject_id SEPARATOR ', ') AS subject_ids, 
//                 GROUP_CONCAT(DISTINCT sub.subject_name ORDER BY sub.subject_name SEPARATOR ', ') AS subject_names
//             FROM selections s
//             JOIN exams e ON s.exam_id = e.exam_id
//             JOIN subjects sub ON s.subject_id = sub.subject_id
//             GROUP BY s.selection_id, e.exam_id
//             ORDER BY e.exam_id;
//         `;

//         const [results] = await db.query(Query);

//         const structuredResults = results.reduce((acc, curr) => {
//             const existingExam = acc.find(item => item.exam_id === curr.exam_id);
//             if (existingExam) {
//                 existingExam.subject_ids += `, ${curr.subject_ids}`;
//                 existingExam.subject_names += `, ${curr.subject_names}`;
//             } else {
//                 acc.push({
//                     selection_id: curr.selection_id,
//                     exam_id: curr.exam_id,
//                     exam_name: curr.exam_name,
//                     subject_ids: curr.subject_ids,
//                     subject_names: curr.subject_names
//                 });
//             }
//             return acc;
//         }, []);

//         res.json(structuredResults);
//     } catch (error) {
//         console.error('Error fetching selections:', error);
//         res.status(500).json({ error: 'Failed to fetch selections' });
//     }
// });

// router.post('/submit-selection', async (req, res) => {
//     const { exam_id, selectedsubjects } = req.body;
 
//     if (!exam_id || !selectedsubjects || selectedsubjects.length === 0) {
//         return res.status(400).send('Exam and at least one subject must be selected');
//     }
 
 
//     try {
       
 
//         const insertPromises = selectedsubjects.map(async (subject_id) => {
//             const [results] = await db.query(
//                 'SELECT COUNT(*) AS count FROM selections WHERE exam_id = ? AND subject_id = ?',
//                 [exam_id, subject_id]
//             );
 
//             if (results[0].count > 0) {
//                 return `Selection for exam ${exam_id} and subject ${subject_id} already exists`;
//             }
 
//             await db.query(
//                 'INSERT INTO selections (exam_id, subject_id) VALUES (?, ?)',
//                 [exam_id, subject_id]
//             );
 
//             return `Subject ${subject_id} added successfully`;
//         });
 
//         const responses = await Promise.all(insertPromises);
//         res.status(200).send('Selection saved successfully. ' + responses.join(' '));
//     } catch (err) {
//         console.error('Error saving selection:', err);
//         res.status(500).send('Error saving selection');
//     }
// });


// router.put('/selections/ExamCreation_update/:id', async (req, res) => {
//     const { id } = req.params;
//     const { exam_id, selectedsubjects } = req.body;
 
//     if (!exam_id || !Array.isArray(selectedsubjects)) {
//         return res.status(400).json({ message: 'Invalid input data' });
//     }
 
   
 
//     try {
//         await db.query('DELETE FROM selections WHERE exam_id = ? AND subject_id NOT IN (?)', [exam_id, selectedsubjects]);
 
//         const insertPromises = selectedsubjects.map(subject_id => {
//             return db.query(
//                 'INSERT INTO selections (exam_id, subject_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE subject_id = VALUES(subject_id)',
//                 [exam_id, subject_id]
//             );
//         });
 
//         await Promise.all(insertPromises);
//         res.json({ message: 'Selection updated successfully' });
//     } catch (err) {
//         console.error('Error updating selection:', err);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
 

// router.delete('/selections/ExamCreation_delete/:exam_id', async (req, res) => {
//     const exam_id = req.params.exam_id;
//     console.log('Received exam_id for deletion:', exam_id); 

//     try {
//         const [results] = await db.query('DELETE FROM selections WHERE exam_id = ?', [exam_id]);

//         console.log('Delete results:', results); 

//         if (results.affectedRows === 0) {
//             console.log(`No selections found with exam_id: ${exam_id}`);
//             return res.status(404).send('Selections not found');
//         }

//         res.status(204).send(); 
//     } catch (err) {
//         console.error('Error deleting selections:', err);
//         res.status(500).send('Error deleting selections');
//     }
// });


module.exports = router;
 
 