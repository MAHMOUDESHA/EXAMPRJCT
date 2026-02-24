import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.jsx';

const EnterMarks = () => {
  const [formData, setFormData] = useState({
    student: '',
    registration_number: '',
    full_name: '',
    subject: '',
    exam: '',
    test1: '',
    test2: '',
    exam_score: ''
  });
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, subjectsRes, examsRes] = await Promise.all([
        api.get('/students/'),
        api.get('/subjects/'),
        api.get('/exams/')
      ]);
      setStudents(studentsRes.data);
      setSubjects(subjectsRes.data);
      setExams(examsRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const handleStudentSelect = (e) => {
    const studentId = parseInt(e.target.value);
    const selectedStudent = students.find(s => s.id === studentId);
    if (studentId && selectedStudent) {
      setFormData({
        ...formData,
        student: studentId,
        registration_number: selectedStudent.registration_number,
        full_name: selectedStudent.full_name
      });
    } else {
      setFormData({
        ...formData,
        student: '',
        registration_number: '',
        full_name: ''
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log('Submitting:', {
      registration_number: formData.registration_number,
      full_name: formData.full_name,
      subject: formData.subject,
      exam: formData.exam,
      test1: parseFloat(formData.test1),
      test2: parseFloat(formData.test2),
      exam_score: parseFloat(formData.exam_score)
    });

    try {
      const response = await api.post('/results/', {
        student: formData.student,
        registration_number: formData.registration_number,
        full_name: formData.full_name,
        subject: formData.subject,
        exam: formData.exam,
        test1: parseFloat(formData.test1),
        test2: parseFloat(formData.test2),
        exam_score: parseFloat(formData.exam_score)
      });
      
      console.log('Success:', response.data);
      alert('Marks saved successfully!');
      
      // Reset form for entering marks for another student
      // Keep the same exam selected for convenience
      setFormData({
        student: '',
        registration_number: '',
        full_name: '',
        subject: '',
        exam: formData.exam,
        test1: '',
        test2: '',
        exam_score: ''
      });
    } catch (error) {
      console.error('Error:', error);
      console.error('Response:', error.response?.data);
      alert('Failed: ' + JSON.stringify(error.response?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-area">
      <h1 style={{ color: '#1976d2', marginBottom: '20px' }}>Enter Marks</h1>

      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Select Student</label>
            <select
              onChange={handleStudentSelect}
              value={formData.student}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
              required
            >
              <option value="">Choose Student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.registration_number} - {student.full_name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Subject</label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
              required
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Exam</label>
            <select
              name="exam"
              value={formData.exam}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
              required
            >
              <option value="">Select Exam</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Test 1</label>
              <input
                type="number"
                name="test1"
                value={formData.test1}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Test 2</label>
              <input
                type="number"
                name="test2"
                value={formData.test2}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Exam</label>
              <input
                type="number"
                name="exam_score"
                value={formData.exam_score}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Marks'}
            </button>
            <button type="button" className="btn" style={{ background: '#f44336', color: 'white' }} onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnterMarks;
