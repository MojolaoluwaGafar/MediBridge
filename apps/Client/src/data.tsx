import { Heart, Brain, Baby, Bone, Venus, Eye, Activity, Stethoscope } from 'lucide-react';
import Tooth from "./assets/Container (1).svg";
import firstAid from "./assets/Icon (2).svg";
import icon from "./assets/Icon (1).svg";
import type { IDepCard } from './types/department';
import type { ViewDeparmentModal } from "./types/department"
import CardiologyImg from "./assets/heart.png"
import NeurologyImg from "./assets/BRAIN.png"
import type { IDoctor } from './types/doctor';

export const departments : IDepCard[] = [
  {
    _id: "1",
    icon: Heart,
    iconBgColor: "#FFF4F3",
    iconColor: "#FC0707",
    availableSpecialist: 5,
    field: "Cardiology",
    category: "Medical",
    summary: "Heart and cardiovascular care. Specialized diagnostics and treatment for heart health."
  },
  {
    _id: "2",
    icon: Brain,
    iconBgColor: "#E0E7FF",
    iconColor: "#4338CA",
    availableSpecialist: 5,
    field: "Neurology",
    category: "Medical",
    summary: "Brain and nervous system care. Advanced neurological assessment and management."
  },
  {
    _id: "3",
    icon: Baby,
    iconBgColor: "#FEF9C3",
    iconColor: "#CA8A04",
    availableSpecialist: 5,
    field: "Pediatrics",
    category: "Women & Children",
    summary: "Healthcare for children and adolescents. Compassionate care for our youngest patients."
  },
  {
    _id: "4",
    icon: function ToothIcon() {
      return <img src={Tooth} alt="Dentistry" />;
    },
    iconBgColor: "#E0F2FE",
    iconColor: "#0284C7",
    availableSpecialist: 5,
    field: "Dentistry",
    category: "Medical",
    summary: "Dental care and oral health. Routine checkups and specialized dental procedures."
  },
  {
    _id: "5",
    icon: Eye,
    iconBgColor: "#F0FDF4",
    iconColor: "#16A34A",
    availableSpecialist: 5,
    field: "Ophthalmology",
    category: "Diagnostics",
    summary: "Diagnosis and treatment of eye and vision problems."
  },
  {
    _id: "6",
    icon: Bone,
    iconBgColor: "#FFF7ED",
    iconColor: "#EA580C",
    availableSpecialist: 5,
    field: "Orthopedics",
    category: "Surgical",
    summary: "Bones, joints, and mobility care. Advanced orthopedic surgery and rehabilitation."
  },
  {
    _id: "7",
    icon: Venus,
    iconBgColor: "#FDF2F8",
    iconColor: "#DB2777",
    availableSpecialist: 5,
    field: "OB-GYN",
    category: "Women & Children",
    summary: "Women’s reproductive health and pregnancy care."
  },
  {
    _id: "8",
    icon: function FirstAidIcon() {
      return <img src={firstAid} alt="General Practice" />;
    },
    iconBgColor: "#F3F4F6",
    iconColor: "#374151",
    availableSpecialist: 5,
    field: "General Practice",
    category: "Medical",
    summary: "Primary and preventive care. Your first point of contact for total health management."
  },
  {
    _id: "9",
    icon: function MentalHealthIcon() {
      return <img src={icon} alt="Mental Health" />;
    },
    iconBgColor: "#CFDFE0",
    iconColor: "#00454B",
    availableSpecialist: 5,
    field: "Mental Health",
    category: "Mental Health",
    summary: "Support for emotional and psychological well-being."
  }
];


export const departmentDetails : ViewDeparmentModal[] = [
  {
    _id: "1",
    icon: Heart,
    field: "Cardiology",
    image: CardiologyImg,
    overview: "Our cardiology department provides comprehensive care for heart and vascular conditions.",
    services: ["ECG", "Echocardiogram", "Stress Test", "Cardiac Catheterization"]
  },
  {
    _id: "2",
    icon: Brain,
    field: "Neurology",
    image: NeurologyImg,
    overview: "We diagnose and treat disorders of the brain, spinal cord, and nerves.",
    services: ["EEG", "MRI Scan", "Stroke Management", "Epilepsy Treatment"]
  },
  {
    _id: "3",
    icon: Activity,
    field: "General Surgery",
    image: "/images/surgery.jpg",
    overview: "Our surgical team performs a wide range of procedures with modern techniques.",
    services: ["Appendectomy", "Gallbladder Removal", "Hernia Repair", "Biopsies"]
  },
  {
    _id: "4",
    icon: Baby,
    field: "Pediatrics",
    image: "/images/pediatrics.jpg",
    overview: "We provide specialized care for infants, children, and adolescents.",
    services: ["Child Wellness Checkups", "Vaccinations", "Growth Monitoring", "Nutritional Counseling"]
  },
  {
    _id: "5",
    icon: Stethoscope,
    field: "Diagnostics",
    image: "/images/diagnostics.jpg",
    overview: "Our diagnostics department offers advanced imaging and laboratory services.",
    services: ["X-Ray", "Ultrasound", "Blood Tests", "CT Scan"]
  }
]


export const doctors: IDoctor[] = [
        {
            _id : "1",
            docImg: "/images/amelia.png",
            docName: "Dr. Amelia Chen",
            department: "Cardiology",
            YOE: 14,
            availability: true,
            about: "Dr. Chen is a board-certified cardiologist with over 14 years of experience in interventional cardiology. He specializes in complex coronary interventions and heart failure",
            availableTime: [
                { day: "Monday", start: "10:00 AM", end: "4:00 PM" },
                { day: "Wednesday", start: "10:00 AM", end: "4:00 PM" }
            ]
        },
        {
            _id : "2",
            docImg: "/images/blessing.png",
            docName: "Dr. Blessing Friday",
            department: "Pediatrics",
            YOE: 10,
            availability: false,
            about: "Dr. Friday is a board-certified Pediatric with over 10 years of experience...",
            availableTime: [
                { day: "Monday", start: "10:00 AM", end: "4:00 PM" },
                { day: "Wednesday", start: "10:00 AM", end: "4:00 PM" }
            ]
        },
        {
            _id : "3",
            docImg: "/images/blessing.png",
            docName: "Dr. West.",
            department: "Pediatrics",
            YOE: 14,
            availability: true,
            about: "Dr. West is a board-certified Pediatric with over 14 years of experience...",
            availableTime: [
                { day: "Monday", start: "12:00 PM", end: "4:00 PM" },
                { day: "Wednesday", start: "14:00 PM", end: "4:00 PM" }
            ]
        },
        {
            _id : "4",
            docImg: "/images/amelia.png",
            docName: "Dr. Angela Chan",
            department: "Neurology",
            YOE: 14,
            availability: true,
            about: "Dr. Chan is a board-certified Neurologist with over 14 years of experience...",
            availableTime: [
                { day: "Monday", start: "10:00 AM", end: "4:00 PM" },
                { day: "Wednesday", start: "10:00 AM", end: "4:00 PM" }
            ]
        },
         {
            _id : "5",
            docImg: "/images/amelia.png",
            docName: "Dr. Cynthia Chan",
            department: "Neurology",
            YOE: 14,
            availability: true,
            about: "Dr. Chan is a board-certified Neurologist with over 14 years of experience...",
            availableTime: [
                { day: "Monday", start: "10:00 AM", end: "4:00 PM" },
                { day: "Wednesday", start: "10:00 AM", end: "4:00 PM" }
            ]
        },
    ];