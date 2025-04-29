import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import LoginPage from './Pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import AttendancePage from './Pages/AttendancePage';
import MarksPage from './Pages/MarksPage';
import TimeTable from './Pages/TimeTable';
import AcademicPlanner from './Pages/AcademicPlanner';
import CGPACalculator from './Pages/CGPACalculator';
import Fun from './Pages/Fun';

function App() {
  return (
    <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path='/fun' element={<Fun />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path='/marks' element={<MarksPage />} />
              <Route path='/timetable' element={<TimeTable />} />
              <Route path='/planner' element={<AcademicPlanner />} />
              <Route path='/cgpa' element={<CGPACalculator />} />
            </Route>
          </Routes>
    </Router>
  );
}

export default App;
