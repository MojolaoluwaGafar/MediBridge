import AppLayout from '../Layout/AppLayout'
import Image from "../assets/home-hero.webp"
import WhyMediBridge from '../Components/HomePageComponents/WhyMediBridge'
import Explore from '../Components/HomePageComponents/Explore'
import Patientstory from "../Components/HomePageComponents/Patientstories"
import FAQ from '../Components/HomePageComponents/FAQ'
import NewsLetter from "../Components/HomePageComponents/NewsLetter"
import Button from '../Components/Button'
import { useAuth } from '../Hooks/Auth/useAuth'
import { useNavigate } from 'react-router'
import { Suspense, useState } from 'react'
import { lazyPage } from '../utils/lazyPage'

// Only signed-in visitors who press "Book Appointment" need the booking flow,
// so its code downloads on that click rather than with the home page.
const BookAppointmentModal = lazyPage(() => import('../Components/PatientPageComponents/DashBoard/BookAppointmentModal'))

export default function HomePage() {
  const [showBooking, setShowBooking] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBookAppointment = () => {
      if (user) {
      setShowBooking(true);
    } else {
      navigate("/login");
    }
  };


  const handleAISupport = () => {
    navigate("/support");
  };

  return (
    <AppLayout headerProps={{
      className : "bg-[#28574E] min-h-[70vh] lg:h-[720px] relative",
      heading : "Healthcare That Connects You",
      subHeading : "Book appointments, talk with trusted doctors, receive support, and get instant AI health guidance in one calm experience.",
      image : Image,
      others : <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-5 fontOutfit w-full'>
      <Button onClick={handleBookAppointment} type="button" content="Book Appointment" variant="secondary" width="w-full max-w-[236px] sm:w-[236px]" />
      <Button onClick={handleAISupport} type="button" content="Chat With AI Support"  variant="primaryWBorder"  width="w-[250px] max-w-[250px] sm:w-[250px]"
      className='bandGreen' />
      </div>
    }}>
      <WhyMediBridge />
      <Explore />
      <Patientstory />
      <FAQ />
      <NewsLetter />

       {showBooking && (
        <Suspense fallback={null}>
        <BookAppointmentModal
          onClose={() => setShowBooking(false)}
          onBooked={() => {
            setShowBooking(false);
          }}
        />
        </Suspense>
      )}
    </AppLayout>
  )
}