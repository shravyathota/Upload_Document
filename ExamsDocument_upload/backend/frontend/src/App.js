import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ExamCreation from './components/ExamCreation';
import Questions from './components/Questions';
function App() {
  return (
    <div>
      <BrowserRouter>
      <Routes>
      <Route path='/' element={<ExamCreation />} />
      <Route path='/Questions' element={<Questions />} />
      </Routes>
      </BrowserRouter>

    </div>
  );
}

export default App;
