import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from '../Pages/dashboard'
import Profile from '../Pages/profile'
import Bookmarks from '../Pages/bookmarks'
import Schedule from '../Pages/schedule'
import Map from '../Pages/map'
import Media from '../Pages/media'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/map" element={<Map />} />
          <Route path="/media" element={<Media />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
