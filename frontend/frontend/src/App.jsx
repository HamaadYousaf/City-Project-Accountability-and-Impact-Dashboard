/*import 'dotenv/config'*/
import './App.css'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Navbar from './Navbar'
import Login from './Login'
import Signup from './Signup'
import Sidebar from './Sidebar/Sidebar'
import DetailedPages from './DetailedPages'
import ScrollToTop from './ScrollTop'

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
              <Route path='/signup' element={<Signup />} />
              <Route path='/login' element={<Login />} />
              <Route path='/projects/:id' element={<DetailedPages />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </>
  )
}