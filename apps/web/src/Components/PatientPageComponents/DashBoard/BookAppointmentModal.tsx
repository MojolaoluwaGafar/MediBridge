import { useState, useMemo, useCallback } from 'react'
import Button from '../../Button'
import { X } from "lucide-react"
import StepOne from '../BookingAppointment/StepOne'
import StepTwo from '../BookingAppointment/StepTwo'
import StepThree from '../BookingAppointment/StepThree'
import { useDoctors } from '../../../Hooks/Doctors/useDoctors'
import StepFour from '../BookingAppointment/StepFour'
import StepFive from '../BookingAppointment/StepFive'
import ConfirmationModal from '../BookingAppointment/ConfirmationModal'
import { useBookAppointment } from '../../../Hooks/Appointments/useBookAppointment'
import type { IBookAppointmentPayload } from '../../../types/apiReqRes'
import type { IDoctor } from '../../../types/doctor'

type Props = {
  onClose: () => void;
  onBooked?: ()=> void;
}

export default function BookAppointmentModal({ onClose, onBooked }: Props) {
  const [step, setStep] = useState(1)
  const [selectedDep, setSelectedDep] = useState<string | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<IDoctor | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [reason, setReason] = useState<string | null>(null)
  const [shareRecords, setShareRecords] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const { bookAppointment, loading, error } = useBookAppointment()
  const { doctors } = useDoctors();

  const parsedDateTime = useMemo(() => {
    if (!selectedDate || !selectedTime) return null;

    return new Date(`${selectedDate} ${selectedTime}`);
  }, [selectedDate, selectedTime]);

  const day = useMemo(() => {
    if (!parsedDateTime) return "";

    return parsedDateTime.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
  }, [parsedDateTime]);

  const time = useMemo(() => {
    if (!parsedDateTime) return "";

    return parsedDateTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
  }, [parsedDateTime]);

  const nextStep = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, 5));
  }, []);

  const prevStep = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleSelectDep = useCallback((dep: string) => {
    setSelectedDep(dep);
    setSelectedDoc(null);
  }, []);

  const handleConfirmAppointment = async () => {
    if (loading) return;

    const appointmentData: IBookAppointmentPayload = {
      department: selectedDep || "",
      doctor: selectedDoc?._id || "",
      date: selectedDate || "",
      time: selectedTime || "",
      reason: reason || "",
      shareRecords,
    }

    try {
      await bookAppointment(appointmentData);
      onBooked?.();
      console.log("Appointment booked :",appointmentData);
      
      setShowConfirmation(true)
    } catch (err) {
      console.error("Booking failed:", err)
    }
  }

  const isDisabled = useMemo(() => {
    return (
        (step === 1 &&
            (!selectedDep ||
                !doctors.some(
                    d => d.department === selectedDep
                ))) ||
        (step === 2 && !selectedDoc) ||
        (step === 3 && (!selectedDate || !selectedTime)) ||
        (step === 4 && !reason)
    );
    }, [
        step,
        selectedDep,
        selectedDoc,
        selectedDate,
        selectedTime,
        reason,
        doctors,
        ]);

  return (
    <>
      {!showConfirmation ? (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="w-131.75 max-w-full max-h-[90vh] overflow-y-scroll scrollbar-none relative rounded-lg bg-white">
            <h1 className="fontOutfit font-semibold text-[22px] px-6 pt-5">
              Book Appointment
            </h1>
            <p className="fontOutfit text-[16px] font-normal pt-1 pb-3 px-6">
              Step {step} of 5
            </p>
            <div className="w-full h-0.5 bg-[#E7E4E4]"></div>
            <button
              className="absolute right-5 top-6"
              onClick={onClose}
              type="button"
            >
              <X size={20} />
            </button>

            <div className="px-6 py-5">
              {step === 1 && <StepOne onSelect={handleSelectDep} DRs={doctors} />}
              {step === 2 && (
                <StepTwo
                  onSelectDoctor={setSelectedDoc}
                  selectedDepartment={selectedDep}
                />
              )}
              {step === 3 && (
                <StepThree
                  doctor={selectedDoc}
                  onSelectDateTime={(date, time) => {
                    setSelectedDate(date)
                    setSelectedTime(time)
                  }}
                />
              )}
              {step === 4 && <StepFour onSelectReason={setReason} />}
              {step === 5 && selectedDoc && (
                <StepFive
                  docImg={selectedDoc.docImg}
                  docName={selectedDoc.docName}
                  department={selectedDep || ""}
                  availability={selectedDoc.availability}
                  date={selectedDate || ""}
                  time={selectedTime || ""}
                  reason={reason || ""}
                  shareRecords={shareRecords}
                  setShareRecords={setShareRecords}
                />
              )}
            </div>

            <div className="px-6 pt-15 pb-5 flex gap-5.75">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  content="Back"
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
                />
              )}
              <Button
                type="button"
                onClick={step === 5 ? handleConfirmAppointment : nextStep}
                content={
                  loading
                    ? "Booking..."
                    : step === 5
                    ? "Confirm Appointment"
                    : "Next"
                }
                disabled={isDisabled || loading}
                className={`px-6 py-2 rounded-md ${
                  isDisabled || loading
                    ? "bg-[#D9D9D9] text-white cursor-not-allowed"
                    : "bg-[#28574E] text-white hover:bg-[#1f4038]"
                }`}
              />
            </div>
              {error && <p className="text-red-500 my-2 text-center">{error}</p>}
          </div>
        </div>
      ) : (
        <ConfirmationModal
          docName={selectedDoc?.docName || ""}
          day={day}
          time={time}
          onClose={onClose}
        />
      )}
    </>
  )
}
