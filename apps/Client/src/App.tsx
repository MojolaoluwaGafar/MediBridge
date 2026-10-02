import './App.css'
import { Routes, Route } from 'react-router'
import Login from './Pages/Auth/Login'
import ForgotPassword from './Pages/Auth/ForgotPassword'
import ResetPassword from './Pages/Auth/ResetPassword'
import VerifyRecovery from './Pages/Auth/VerifyRecovery'
import Activate from './Pages/Auth/Activate'
import SetPassword from './Pages/Auth/SetPassword'
import VerifyActivation from './Pages/Auth/VerifyActivation'

import HomePage from './Pages/HomePage'
import DepartmentPage from './Pages/DepartmentPage'
import SupportPage from './Pages/SupportPage'
import ScrollToTop from './Components/ScrollToTop'
import PatientPage from './Pages/PatientPage'
import Error404 from './Components/Error404'
import ProtectRoute from './Components/ProtectRoute'
import AboutPage from './Pages/AboutPage'
import PrivacyPage from './Pages/PrivacyPage'
import TermsPage from './Pages/TermsPage'
import ContactPage from './Pages/ContactPage'
import PortalComingSoon from './Pages/PortalComingSoon'
import DoctorPage from './Pages/DoctorPage'

import UnderConstruction from "./Components/UnderConstruction"

import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";

function App() {

  return (
    <>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/activate" element={<Activate />} />
      <Route path="/verifyActivation" element={<VerifyActivation />} />
      <Route path="/setPassword" element={<SetPassword />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/verifyRecovery" element={<VerifyRecovery />} />
      <Route path="/resetPassword" element={<ResetPassword />} />

      <Route path="/" element={<HomePage />} />
      <Route path="/departments" element={<DepartmentPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path='/patientDashboard' element={<ProtectRoute roles={["user"]}><PatientPage /></ProtectRoute>} />
      <Route path='/doctorDashboard' element={<ProtectRoute roles={["doctor"]}><DoctorPage /></ProtectRoute>} />
      {/* Placeholder until the admin portal is built. */}
      <Route path='/adminDashboard' element={<ProtectRoute roles={["admin"]}><PortalComingSoon portal="Admin" /></ProtectRoute>} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/underConstruction" element={<UnderConstruction />} />
      
      <Route path="*" element={<Error404 />} />
    </Routes>
    
    <ToastContainer  position='top-center'
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    pauseOnHover
    draggable />
    <ScrollToTop />
    </>
  )
}

export default App
