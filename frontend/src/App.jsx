import './App.css'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar/Sidebar'
import DetailedPages from './DetailedPages'
import ScrollToTop from './ScrollTop'
import 'leaflet/dist/leaflet.css';

export default function App() {
  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />
        <div className='main-content'>
          <div className='page-content'>
            <Routes>
              <Route path='/' element={<Sidebar />} />
              <Route path='/projects/:id' element={<DetailedPages />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </>
  )
}