import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import PostureCoach from './pages/PostureCoach';
import CalorieCalculator from './pages/CalorieCalculator';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import TargetedMuscle from './pages/TargetedMuscle';
import AnimationsDemo from './pages/AnimationsDemo';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="workouts" element={<Workouts />} />
              <Route path="posture" element={<PostureCoach />} />
              <Route path="calculator" element={<CalorieCalculator />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="targeted-muscle" element={<TargetedMuscle />} />
              <Route path="animations" element={<AnimationsDemo />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
