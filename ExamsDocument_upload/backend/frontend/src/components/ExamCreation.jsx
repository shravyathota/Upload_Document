import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MainsForm.css';
import { IoMdHome } from "react-icons/io";
import Logo_img from '../Images/egate-logo.png'
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
        <h1> Document Uplaod page</h1>
      </div>
      <button className='btnes' onClick={() => setModalOpen(true)}>Document Upload</button>

      {modalOpen && (
        <div className='examform'>
          <div className='modal'>
            <div className='content_s'>
              <SelectionForm
                // onSubmit={editingSelection === null ? handleSubmitSelection : handleUpdateSelection}
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


    </div>
  );
};
const handleFileChange = (event) => {
  const file = event.target.files[0]; // Get the first selected file
  if (file) {
    console.log('Selected file:', file.name); // Log the file name
  } else {
    console.log('No file selected');
  }
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
  
  <form onSubmit={onSubmit} className='ECUploadForm'>
    <h1 className='ECUploadFormh1'>{editingSelection ? 'Edit Selection' : 'Exam Selection'}</h1>
    <div className='div1'>
      <label htmlFor="exam">Select Exam:</label>
      <select id="examcreation" className='dropdown' value={selectedExam} onChange={onExamChange}>
        <option value="">--Select an exam--</option>
        {exams.map(exams => (
          <option key={exams.exam_id} value={exams.exam_id}>{exams.exam_name}</option>
        ))}
      </select>
    </div>
  
      <div className='div1'>
        <label htmlFor="subject-select">Select Subjects:</label>
        <select id="subject-select" className='dropdown' onChange={onSubjectChange}>
          <option value="" >Select a subject</option>
          {subjects.map(subject => (
            <option
              key={subject.subject_id}
              value={subject.subject_id}
              selected={selectedSubjects.includes(subject.subject_id.toString())}
            >
              {subject.subject_name}
            </option>
          ))}
        </select>
      </div>
      <div className='div1'>
  <label htmlFor="document-upload">Choose Document:</label>
  <input 
    type="file" 
    id="document-upload" 
    accept=".doc, .docx" 
    onChange={handleFileChange}
    className='dropdown'
  />
</div>

<div className='div1SubmitBtn'>
<button type="submit" className='ECUploadFormSubmitBtn'>Upload</button>
</div>
   
  </form>
);

export default ExamCreation;
