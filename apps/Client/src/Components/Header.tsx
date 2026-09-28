import React, { useState } from 'react'
import Logo from "../assets/MediBridgeLogo.svg"
import { NavLink, Link } from 'react-router'
import Button from './Button'
import { useAuth } from '../Hooks/Auth/useAuth'
import { Menu, X } from "lucide-react"

type Props = {
  className?: string,
  heading?: string,
  subHeading?: string,
  image?: string,
  others?: React.ReactNode
}

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/departments", label: "Departments" },
  { to: "/support", label: "AI Support" },
  { to: "/about", label: "About Us" },
];

export default function Header({ className, heading, subHeading, others, image }: Props) {
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  return (
    <div className={`${className} relative px-5 md:px-20 py-5 w-full`}>
      <div className="mx-auto container">
        <nav className="bg-white rounded-full flex justify-between items-center px-5 md:px-10 h-20">
          <Link to="/"><img src={Logo} alt="MediBridge Logo" /></Link>

          <div className="hidden md:flex gap-5 items-center fontOutfit">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  isActive ? "text-[18px] text-[#28574E] font-semibold" : "text-[18px]"
                }
              >
                <p className="text-[18px]">{label}</p>
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <Link to="/patientDashboard">
                <Button className="px-4 fontOutfit" type="button" content="Go to dashboard" />
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <button
                    type="button"
                    className="text-[#28574E] text-[18px] fontOutfit border-0 h-13 font-semibold"
                  >
                    Login
                  </button>
                </Link>
                <Link to="/activate">
                  <Button className="px-4 fontOutfit" type="button" content="Activate Account" />
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-2xl text-[#28574E]"
            onClick={() => setMenuOpen(true)}
          >
            <Menu />
          </button>
        </nav>

        <div className="flex flex-col items-center justify-center py-10 md:py-25 w-full md:w-195 mx-auto text-center gap-3">
          <h1 className="text-[36px] md:text-[58px] text-white font-extrabold fontLibre leading-[100%]">
            {heading}
          </h1>
          <p className="text-[16px] md:text-[20px] text-[#DAD8D8] font-light w-full md:w-160 text-center fontOutfit">
            {subHeading}
          </p>
          <div className="flex gap-5 pt-5 z-10">{others}</div>
        </div>
      </div>

      <img
        className="w-full hidden lg:flex md:w-225.5 absolute top-40 md:top-107 left-1/2 transform -translate-x-1/2"
        src={image}
        alt=""
      />

      {menuOpen && (
        <div
          className="fixed inset-0 bg-transparent z-50 flex justify-end"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="bg-white w-64 h-full shadow-lg p-6 flex flex-col gap-6 transform transition-transform duration-300 translate-x-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="self-end text-2xl text-[#28574E]"
              onClick={() => setMenuOpen(false)}
            >
              <X />
            </button>

            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  isActive ? "text-[18px] text-[#28574E] font-semibold" : "text-[18px]"
                }
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}

            <div className="mt-auto">
              {isAuthenticated ? (
                <Link to="/patientDashboard" onClick={() => setMenuOpen(false)}>
                  <Button className="w-full fontOutfit" type="button" content="Go to dashboard" />
                </Link>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    <button
                      type="button"
                      className="text-[#28574E] text-[18px] fontOutfit border-0 h-13 font-semibold w-full text-left"
                    >
                      Login
                    </button>
                  </Link>
                  <Link to="/activate" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full fontOutfit" type="button" content="Activate Account" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
