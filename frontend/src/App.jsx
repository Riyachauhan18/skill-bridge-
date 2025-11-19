import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Profile from './pages/Profile.jsx'
import Skills from './pages/Skills.jsx'
import Achievements from './pages/Achievements.jsx'
import Internships from './pages/Internships.jsx'
import Seniors from './pages/Seniors.jsx'
import Overview from './pages/Overview.jsx'
import EditInformation from './pages/EditInformation.jsx'
import PS1 from './pages/PS1.jsx'
import PS2 from './pages/PS2.jsx'
import Hackathons from './pages/Hackathons.jsx'
import ResearchWork from './pages/ResearchWork.jsx'
import Messages from './pages/Messages.jsx'
import Logout from './pages/Logout.jsx'
import AdminOverview from './pages/AdminOverview.jsx'
import MentorFinder from './pages/MentorFinder.jsx'

function AdminMentorRoute() {
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null
  if (role !== 'admin') {
    return <Navigate to="/dashboard/overview" replace />
  }
  return <MentorFinder />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="admin" element={<AdminOverview />} />
        <Route path="mentor-finder" element={<AdminMentorRoute />} />
        <Route path="overview" element={<Overview />} />
        <Route path="profile" element={<Profile />} />
        <Route path="messages" element={<Messages />} />
        <Route path="messages/:roll" element={<Messages />} />
        <Route path="edit-info" element={<EditInformation />} />
        <Route path="skills" element={<Skills />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="internships" element={<Internships />} />
        <Route path="ps1" element={<PS1 />} />
        <Route path="ps2" element={<PS2 />} />
        <Route path="hackathons" element={<Hackathons />} />
        <Route path="research" element={<ResearchWork />} />
        <Route path="seniors" element={<Seniors />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
