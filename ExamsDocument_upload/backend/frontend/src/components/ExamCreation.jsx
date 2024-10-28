
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './MainsForm.css';
// import { IoMdHome } from "react-icons/io";
// import Logo_img from '../Images/egate-logo.png';
// import Leftnavbar from './Leftnavbar';
// import { RxCross2 } from "react-icons/rx";

// const ExamCreation = () => {
//   const [modalOpen, setModalOpen] = useState(false);
//   const [exams, setExams] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [selectedExam, setSelectedExam] = useState('');
//   const [selectedSubjects, setSelectedSubjects] = useState([]);


//   useEffect(() => {
//     fetch('http://localhost:5000/ExamCreation/exams')
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .then(data => setExams(data))
//         .catch(error => console.error('Error fetching exams:', error));
// }, []); 

// useEffect(() => {
//     if (selectedExam) {
//         fetch(`http://localhost:5000/ExamCreation/subjectsForExams/${selectedExam}`)
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error('Network response was not ok');
//                 }
//                 return response.json();
//             })
//             .then(data => setSubjects(data))
//             .catch(error => console.error('Error fetching subjects:', error));
//     } else {
//         setSubjects([]);
//     }
// }, [selectedExam]); 


//   const handleExamChange = (event) => {
//     setSelectedExam(event.target.value);
//     setSelectedSubjects([]);
//   };

//   const handleSubjectChange = (event) => {
//     console.log(event.target.value)
//     // const selectedOptions = Array.from(event.target.value);
//     setSelectedSubjects(event.target.value);
//   };


//   const resetForm = () => {
//     setModalOpen(false);
//     setSelectedExam('');
//     setSelectedSubjects([]);
//   };

//   const handleSubmit = async (event) => {
//     console.log("submit clicked");
//     event.preventDefault();

//     const formData = new FormData();
//     formData.append('document', event.target.document.files[0]); 
//     formData.append('examId', selectedExam);
//     formData.append('selectedSubjects', selectedSubjects); 

//     try {
//         const response = await axios.post('http://localhost:5000/ExamCreation/uploadDocument', formData, {
//             headers: {
//                 'Content-Type': 'multipart/form-data',
//             },
//         });
//         console.log(response.data); // Log success message
//         alert("Document Uploaded Succesfully")
//         resetForm(); // Reset form after successful submission
//     } catch (error) {
//         console.error('Error uploading document:', error);
//     }
// };

//   return (
//     <div>
//       <div className='headerjeem'>
//         <div className='headerjee'>
//           <img src={Logo_img} alt="Logo" />
//         </div>
//         <a className='jeeanchor' href='/Home'>
//           <IoMdHome /> Home
//         </a>
//       </div>
//       <Leftnavbar />
//       <div className='headerpageh1'>
//         <h1> Document Upload page</h1>
//       </div>
//       <button className='btnes' onClick={() => setModalOpen(true)}>Document Upload</button>

//       {modalOpen && (
//         <div className='examform'>
//           <div className='modal'>
//             <div className='content_s'>
//               <SelectionForm
//                 onSubmit={handleSubmit}
//                 selectedExam={selectedExam}
//                 onExamChange={handleExamChange}
//                 subjects={subjects}
//                 onSubjectChange={handleSubjectChange}
//                 exams={exams}
//               />
//               <button className='closebutton' onClick={resetForm}><RxCross2 /></button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>

//   );
// };


// const SelectionForm = ({
//   onSubmit,
//   selectedExam,
//   onExamChange,
//   subjects,
//   selectedSubjects,
//   onSubjectChange,
//   editingSelection,
//   exams
// }) => (
//   <form onSubmit={onSubmit} className='ECUploadForm'>
//     <h1 className='ECUploadFormh1'>{editingSelection ? 'Edit Selection' : 'Exam Selection'}</h1>
//     <div className='div1'>
//       <label htmlFor="exam">Select Exam:</label>
//       <select id="examcreation" className='dropdown' value={selectedExam} onChange={onExamChange}>
//         <option value="">--Select an exam--</option>
//         {exams.map(exam => (
//           <option key={exam.exam_id} value={exam.exam_id}>{exam.exam_name}</option>
//         ))}
//       </select>
//     </div>

//     <div className='div1'>
//       <label htmlFor="subject-select">Select Subjects:</label>
//       <select
//         id="subject-select"
//         className='dropdown'
//         // multiple
//         value={selectedSubjects}
//         onChange={onSubjectChange}
//       >
//          <option value="">--Select an subject--</option>
//         {subjects.map(subject => (
//           <option
//             key={subject.subject_id}
//             value={subject.subject_id}

//           >
//             {subject.subject_name}
//           </option>
//         ))}
//       </select>
//     </div>

//     <div className='div1'>
//       <label>Topic Name</label>
//       <input type='text'  />

//     </div>


//     <div className='div1'>
//       <label htmlFor="document-upload">Choose Document:</label>
//       <input
//       className='dropdown'
//         type="file"
//         id="document-upload"
//         name="document"
//         accept=".doc,.docx"
//         required
//       />
//     </div>

//     <button type="submit" className='uploadbutton'>Submit</button>
//   </form>
// );

// export default ExamCreation;





















import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MainsForm.css';
import { IoMdHome } from "react-icons/io";
import Logo_img from '../Images/egate-logo.png';
import Leftnavbar from './Leftnavbar';
import { RxCross2 } from "react-icons/rx";

const ExamCreation = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [topicName, setTopicName] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/ExamCreation/exams')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setExams(data))
      .catch(error => console.error('Error fetching exams:', error));
  }, []);

  useEffect(() => {
    if (selectedExam) {
      fetch(`http://localhost:5000/ExamCreation/subjectsForExams/${selectedExam}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => setSubjects(data))
        .catch(error => console.error('Error fetching subjects:', error));
    } else {
      setSubjects([]);
      setSelectedSubjects([]); // Clear selected subjects when exam is changed
      setTopicName(''); // Reset topic name
    }
  }, [selectedExam]);

  const handleExamChange = (event) => {
    setSelectedExam(event.target.value);
    setSelectedSubjects([]);
    setTopicName(''); // Reset topic name when exam changes
  };

  const handleSubjectChange = (event) => {
    const selectedId = event.target.value;
    setSelectedSubjects(selectedId);

    // Assuming the subject name or any other relevant data you want to display as topic comes from the selected subject ID.
    const selectedSubject = subjects.find(subject => subject.subject_id === selectedId);
    if (selectedSubject) {
      setTopicName(selectedSubject.topic_name || ''); // Set topic name based on selected subject
    } else {
      setTopicName(''); // Reset if no subject is selected
    }
  };
  const handleTopicChange = (event) => {
    setTopicName(event.target.value); // Update topic name based on input
  };
  const resetForm = () => {
    setModalOpen(false);
    setSelectedExam('');
    setSelectedSubjects([]);
    setTopicName(''); // Reset topic name
    console.log(topicName)
  };

  const handleSubmit = async (event) => {
    console.log("submit clicked");
    event.preventDefault();

    const formData = new FormData();
    formData.append('document', event.target.document.files[0]);
    formData.append('examId', selectedExam);
    formData.append('selectedSubjects', selectedSubjects);
    formData.append('topicName', topicName); // Append topic name to form data

    try {
      const response = await axios.post('http://localhost:5000/ExamCreation/uploadDocument', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data); // Log success message
      alert("Document Uploaded Successfully")
      resetForm(); // Reset form after successful submission
    } catch (error) {
      console.error('Error uploading document:', error);
    }
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
        <h1> Document Upload page</h1>
      </div>
      <button className='btnes' onClick={() => setModalOpen(true)}>Document Upload</button>

      {modalOpen && (
        <div className='examform'>
          <div className='modal'>
            <div className='content_s'>
              <SelectionForm
                onSubmit={handleSubmit}
                selectedExam={selectedExam}
                onExamChange={handleExamChange}
                subjects={subjects}
                onSubjectChange={handleSubjectChange}
                exams={exams}
                topicName={topicName}
                onTopicChange={handleTopicChange}
              />
              <button className='closebutton' onClick={resetForm}><RxCross2 /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SelectionForm = ({
  onSubmit,
  selectedExam,
  onExamChange,
  selectedSubjects,
  subjects,
  onSubjectChange,
  exams,
  topicName, // Receive topic name as a prop
  onTopicChange // Receive onTopicChange prop
}) => (
  <form onSubmit={onSubmit} className='ECUploadForm'>
    <h1 className='ECUploadFormh1'>Exam Selection</h1>
    <div className='div1'>
      <label htmlFor="exam">Select Exam:</label>
      <select id="examcreation" className='dropdown' value={selectedExam} onChange={onExamChange}>
        <option value="">--Select an exam--</option>
        {exams.map(exam => (
          <option key={exam.exam_id} value={exam.exam_id}>{exam.exam_name}</option>
        ))}
      </select>
    </div>

    <div className='div1'>
      <label htmlFor="subject-select">Select Subjects:</label>
      <select
        id="subject-select"
        className='dropdown'
        value={selectedSubjects}
        onChange={onSubjectChange}
      >
        <option value="">--Select a subject--</option>
        {subjects.map(subject => (
          <option
            key={subject.subject_id}
            value={subject.subject_id}
          >
            {subject.subject_name}
          </option>
        ))}
      </select>
    </div>

    <div className='div1'>
      <label>Topic Name:</label>
      <input
        type='text'
        value={topicName} // Bind the input to topic name state
        onChange={onTopicChange} // Add onChange handler here
        className='topicNameEC'
      />
    </div>

    <div className='div1'>
      <label htmlFor="document-upload">Choose Document:</label>
      <input
        className='dropdown'
        type="file"
        id="document-upload"
        name="document"
        accept=".doc,.docx"
        required
      />
    </div>

    <button type="submit" className='uploadbutton'>Submit</button>
  </form>
);


export default ExamCreation;


