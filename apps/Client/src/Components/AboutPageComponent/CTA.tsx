import { useNavigate } from "react-router";
import { useAuth } from "../../Hooks/Auth/useAuth";
import { useState } from "react";
import Button from "../Button";
import BookAppointmentModal from "../PatientPageComponents/DashBoard/BookAppointmentModal";
const CTA = () => {
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
    <section className="bg-[#F7F7F5] py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="rounded-[40px] bg-[#28574E] px-8 py-20 text-center md:px-16">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 text-lg font-medium text-white">
            Get Started Today
          </span>

          <h2 className="mt-6 font-serif text-5xl font-bold text-white leading-tight">
            Ready to experience
            <br />
            better healthcare?
          </h2>

          <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-white/80">
            Join thousands of patients using MediBridge to connect with
            trusted healthcare professionals, access AI-powered support,
            and manage their care with confidence.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row">
                 <Button onClick={handleBookAppointment} type="button" content="Book Appointment" variant="secondary" width="w-[236px]" />
                 <Button onClick={handleAISupport} type="button" content="Chat With AI Support"  variant="primaryWBorder"  width="w-[236px]"
                 className='bandGreen' />
          </div>
        </div>
      </div>

      {showBooking && (
              <BookAppointmentModal
                onClose={() => setShowBooking(false)}
                onBooked={() => {
                  setShowBooking(false);
                }}
              />
            )}
    </section>
  );
};

export default CTA;