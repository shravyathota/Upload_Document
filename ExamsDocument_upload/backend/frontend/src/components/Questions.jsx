import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Questions = () => {
  const [examDetails, setExamDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const response = await axios.get('http://localhost:5000/ExamCreation/exams');
        setExamDetails(response.data);
      } catch (err) {
        console.error('Error fetching exam details:', err);
        setError('Failed to fetch exam details');
      } finally {
        setLoading(false);
      }
    };

    fetchExamDetails();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className='questions-container'>
      <h1>Exam Details</h1>
      {examDetails.length === 0 ? (
        <p>No exam details found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Exam ID</th>
              <th>Exam Name</th>
              <th>Document</th>
              <th>Selected Subjects</th>
            </tr>
          </thead>
          <tbody>
            {examDetails.map((exam) => (
              <tr key={exam.exam_id}>
                <td>{exam.exam_id}</td>
                <td>{exam.exam_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Questions;
