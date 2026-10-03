import './App.css'
import { Suspense } from "react"
import { Routes, Route } from 'react-router'

// Home and Login are what most visits start on, so they ship in the main
// bundle. Every other page is its own chunk, downloaded the first time it is
// opened (see docs/architecture/performance.md).
import HomePage from './Pages/HomePage'
import Login from './Pages/Auth/Login'
import ScrollToTop from './Components/ScrollToTop'
import ProtectRoute from './Components/ProtectRoute'
import PageLoader from './Components/PageLoader'
import { lazyPage } from './utils/lazyPage'

const ForgotPassword = lazyPage(() => import('./Pages/Auth/ForgotPassword'))
const ResetPassword = lazyPage(() => import('./Pages/Auth/ResetPassword'))
const VerifyRecovery = lazyPage(() => import('./Pages/Auth/VerifyRecovery'))
const Activate = lazyPage(() => import('./Pages/Auth/Activate'))
const SetPassword = lazyPage(() => import('./Pages/Auth/SetPassword'))
const VerifyActivation = lazyPage(() => import('./Pages/Auth/VerifyActivation'))
const DepartmentPage = lazyPage(() => import('./Pages/DepartmentPage'))
const SupportPage = lazyPage(() => import('./Pages/SupportPage'))
const PatientPage = lazyPage(() => import('./Pages/PatientPage'))
const DoctorPage = lazyPage(() => import('./Pages/DoctorPage'))
const AboutPage = lazyPage(() => import('./Pages/AboutPage'))
const PrivacyPage = lazyPage(() => import('./Pages/PrivacyPage'))
const TermsPage = lazyPage(() => import('./Pages/TermsPage'))
const ContactPage = lazyPage(() => import('./Pages/ContactPage'))
const AdminPage = lazyPage(() => import('./Pages/AdminPage'))
const Error404 = lazyPage(() => import('./Components/Error404'))
const UnderConstruction = lazyPage(() => import("./Components/UnderConstruction"))

import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";

function App() {

  return (
    <>
    <Suspense fallback={<PageLoader />}>
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
      <Route path='/adminDashboard' element={<ProtectRoute roles={["admin"]}><AdminPage /></ProtectRoute>} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/underConstruction" element={<UnderConstruction />} />
      
      <Route path="*" element={<Error404 />} />
    </Routes>
    </Suspense>
    
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
