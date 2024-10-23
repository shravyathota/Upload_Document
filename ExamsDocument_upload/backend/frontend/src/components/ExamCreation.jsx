import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MainsForm.css';
import { IoMdHome } from "react-icons/io";
import Logo_img from '../Images/image.png';
import Leftnavbar from './Leftnavbar';
import { RxCross2 } from "react-icons/rx";

const ExamCreation = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selections, setSelections] = useState([]);
  const [editingSelection, setEditingSelection] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/ExamCreation/exams')
      .then(response => setExams(response.data))
      .catch(error => console.error('Error fetching exams:', error));
  }, []);

  useEffect(() => {
    if (selectedExam) {
      axios.get(`http://localhost:5000/ExamCreation/exam/${selectedExam}/subjects`)
        .then(response => setSubjects(response.data))
        .catch(error => console.error('Error fetching subjects:', error));
    } else {
      setSubjects([]);
    }
  }, [selectedExam]);

  useEffect(() => {
    axios.get('http://localhost:5000/ExamCreation/selections')
      .then(response => {
        setSelections(response.data);
      })
      .catch(error => console.error('Error fetching selections:', error));
  }, []);

  const handleExamChange = (event) => {
    setSelectedExam(event.target.value);
    setSelectedSubjects([]);
  };

  const handleSubjectChange = (event) => {
    const { value, checked } = event.target;
    setSelectedSubjects(prev => 
        checked ? [...prev, value] : prev.filter(subject => subject !== value)
    );
  };

  const handleSubmitSelection = (event) => {
    event.preventDefault();
    const data = {
        exam_id: selectedExam,
        selectedsubjects: selectedSubjects,
    };

    axios.post('http://localhost:5000/ExamCreation/submit-selection', data)
        .then(() => {
            alert('Selection saved successfully');
            return axios.get('http://localhost:5000/ExamCreation/selections'); // Refresh selections
        })
        .then(response => {
            setSelections(response.data);
            resetForm();
        })
        .catch(error => console.error('Error saving selection:', error));
  };

  const handleEdit = (index) => {
    const selectionToEdit = selections[index];
    if (selectionToEdit) {
      console.log('Editing selection:', selectionToEdit); // Debugging
      setEditingSelection(selectionToEdit.selection_id);
      setSelectedExam(selectionToEdit.exam_id);
  
      const subjectIds = selectionToEdit.subject_ids || "";
      if (typeof subjectIds === 'string') {
        setSelectedSubjects(subjectIds.split(',').map(id => id.trim()));
      } else {
        console.error('Expected subject_ids to be a string but received:', subjectIds);
        setSelectedSubjects([]);
      }
      setModalOpen(true);
    }
  };
  
  const handleUpdateSelection = (event) => {
    event.preventDefault();
    const data = {
        exam_id: selectedExam,
        selectedsubjects: selectedSubjects,
    };

    axios.put(`http://localhost:5000/ExamCreation/selections/ExamCreation_update/${editingSelection}`, data)
        .then(() => {
            alert('Selection updated successfully');
            return axios.get('http://localhost:5000/ExamCreation/selections'); // Refresh selections
        })
        .then(response => {
            setSelections(response.data);
            resetForm();
        })
        .catch(error => console.error('Error updating selection:', error));
  };

  const handleDelete = (exam_id) => {
    console.log("Attempting to delete selection with ID:", exam_id); // Log the ID
    if (exam_id === undefined) {
        console.error("Selection ID is undefined. Cannot proceed with deletion.");
        return;
    }

    if (window.confirm('Are you sure you want to delete this selection?')) {
        axios.delete(`http://localhost:5000/ExamCreation/selections/ExamCreation_delete/${exam_id}`)
            .then(() => {
                alert('Selection deleted successfully');
                return axios.get('http://localhost:5000/ExamCreation/selections'); // Refresh selections
            })
            .then(response => {
                setSelections(response.data);
            })
            .catch(error => {
                console.error('Error deleting selection:', error);
                alert('Failed to delete selection. Please try again.');
            });
    }
};

  const resetForm = () => {
    setModalOpen(false);
    setSelectedExam('');
    setEditingSelection(null);
    setSelectedSubjects([]);
  };

  return (
    <div>
      <div className='headerjeem'>
        <div className='headerjee'>
          <img src={Logo_img} alt="Logo" />
        </div>
        <a className='jeeanchor' href='/Home'>
          <IoMdHome /> Home
        </a>
      </div>
      <Leftnavbar />
      <div className='headerpageh1'>
        <h1> Exam Selection Page</h1>
      </div>
      <button className='btnes' onClick={() => setModalOpen(true)}>Exam Selection</button>

      {modalOpen && (
        <div className='examform'>
          <div className='modal'>
            <div className='content_s'>
              <SelectionForm 
                onSubmit={editingSelection === null ? handleSubmitSelection : handleUpdateSelection}
                selectedExam={selectedExam}
                onExamChange={handleExamChange}
                subjects={subjects}
                selectedSubjects={selectedSubjects}
                onSubjectChange={handleSubjectChange}
                editingSelection={editingSelection}
                exams={exams} // Pass the exams here
              />
              <button className='closebutton' onClick={resetForm}><RxCross2 /></button>
            </div>
          </div>
        </div>
      )}

      <div className='selections-tablecontainer'>
        <h2>Selection Table</h2>
        <table className='selections-table'>
          <thead>
            <tr>
              <th>S.no</th>
              <th>Exam Name</th>
              <th>Subject Names</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {selections.map((selection, index) => (
              <tr key={selection.selection_id}>
                <td>{index + 1}</td>
                <td>{selection.exam_name}</td>
                <td>{selection.subject_names}</td>
                <td className='upddel'>
                  <button className="update" onClick={() => handleEdit(index)}>Update</button>
                  <button className="delete" onClick={() => handleDelete(selection.exam_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SelectionForm = ({ 
  onSubmit, 
  selectedExam, 
  onExamChange, 
  subjects, 
  selectedSubjects, 
  onSubjectChange, 
  editingSelection,
  exams 
}) => (
  <form onSubmit={onSubmit}>
    <h1>{editingSelection ? 'Edit Selection' : 'Exam Selection'}</h1>
    <div className='div1'>
      <label htmlFor="exam">Select Exam:</label>
      <select id="examcreation" className='dropdown' value={selectedExam} onChange={onExamChange}>
        <option value="">--Select an exam--</option>
        {exams.map(exam => (
          <option key={exam.exam_id} value={exam.exam_id}>{exam.exam_name}</option>
        ))}
      </select>
    </div>
    {subjects.length > 0 && (
      <div className='div1'>
        <label>Select Subjects:</label>
        {subjects.map(subject => (
          <div key={subject.subject_id}>
            <input
              type='checkbox'
              id={`subject-${subject.subject_id}`}
              value={subject.subject_id}
              checked={selectedSubjects.includes(subject.subject_id.toString())}
              onChange={onSubjectChange}
            />
            <label htmlFor={`subject-${subject.subject_id}`}>{subject.subject_name}</label>
          </div>
        ))}
      </div>
    )}
    <button type="submit">{editingSelection ? 'Update Selection' : 'Submit Selection'}</button>
  </form>
);

export default ExamCreation;
