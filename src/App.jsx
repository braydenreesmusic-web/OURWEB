import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from '../Pages/dashboard'
import Profile from '../Pages/profile'
import Bookmarks from '../Pages/bookmarks'
import Schedule from '../Pages/schedule'
import Map from '../Pages/map'
import Media from '../Pages/media'
import SignIn from '../Pages/signin'
import BottomTabs from '../Components/BottomTabs'
import { useAuth } from './auth'
import { Navigate, useLocation } from 'react-router-dom'
import './App.css'

function RequireAuth({ children }) {
  const user = useAuth();
  const location = useLocation();
  if (user === undefined) return null; // loading
  if (!user) return <Navigate to="/signin" state={{ from: location }} replace />;
  return children;
}

function AppShell() {
  const location = useLocation();
  const hideTabs = location.pathname === '/signin';
  return (
    <div className="min-h-screen pb-20">
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/map" element={<Map />} />
                <Route path="/media" element={<Media />} />
              </Routes>
            </RequireAuth>
          }
        />
      </Routes>
      {!hideTabs && <BottomTabs />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App
