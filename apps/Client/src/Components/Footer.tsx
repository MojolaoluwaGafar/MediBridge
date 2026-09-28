import Logo from '../assets/MediBridgeLogo.svg'
import { Link } from 'react-router'

export default function Footer() {
  const links = [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" },
    { label: "Support Center", to: "/support" },
    { label: "Contact", to: "/contact" },
  ]

  return (
    <div className="w-full bg-[#E2DFDF] px-5 md:px-10 py-6">
      <div className="mx-auto container flex flex-col md:flex-row items-center md:justify-between gap-4 md:gap-0 fontOutfit text-center md:text-left">
        
        <img src={Logo} alt="MediBridge Logo" className="w-32 md:w-auto" />

        <div className="flex flex-wrap justify-center gap-3 md:gap-6">
          {links.map((link, index) => (
            <Link key={index} to={link.to} className="text-sm md:text-base">
              {link.label}
            </Link>
          ))}
        </div>

        <p className="text-xs md:text-sm">
          © 2026 MediBridge Healthcare. Calm & Trusted Care.
        </p>
      </div>
    </div>
  )
}
