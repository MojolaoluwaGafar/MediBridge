import AppLayout from '../Layout/AppLayout'
import Image from "../assets/Frame 2085662224.svg"
import WhyMediBridge from '../Components/HomePageComponents/WhyMediBridge'
import Explore from '../Components/HomePageComponents/Explore'
import Patientstory from "../Components/HomePageComponents/Patientstories"
import FAQ from '../Components/HomePageComponents/FAQ'
import NewsLetter from "../Components/HomePageComponents/NewsLetter"
import Button from '../Components/Button'
import { useAuth } from '../Hooks/Auth/useAuth'
import { useNavigate } from 'react-router'
import { useState } from 'react'
import BookAppointmentModal from '../Components/PatientPageComponents/DashBoard/BookAppointmentModal'

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
      className : "bg-[#28574E] h-[90vh] lg:h-[720px] relative",
      heading : "Healthcare That Connects You",
      subHeading : "Book appointments, talk with trusted doctors, receive support, and get instant AI health guidance in one calm experience.",
      image : Image,
      others : <div className='flex flex-col lg:flex lg:flex-row items-center gap-5 fontOutfit'>
      <Button onClick={handleBookAppointment} type="button" content="Book Appointment" variant="secondary" width="w-[236px]" />
      <Button onClick={handleAISupport} type="button" content="Chat With AI Support"  variant="primaryWBorder"  width="w-[236px]"
      className='bandGreen' />
      </div>
    }}>
      <WhyMediBridge />
      <Explore />
      <Patientstory />
      <FAQ />
      <NewsLetter />

       {showBooking && (
        <BookAppointmentModal
          onClose={() => setShowBooking(false)}
          onBooked={() => {
            setShowBooking(false);
          }}
        />
      )}
    </AppLayout>
  )
}