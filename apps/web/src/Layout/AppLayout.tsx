import { useEffect, useState } from "react";
import Footer from "../Components/Footer";
import Header from "../Components/Header";

type Props = {
    children : React.ReactNode,
    headerProps? : {
        className?: string,
        heading? : string,
        subHeading? : string,
        image? : string,
        others?: React.ReactNode
    }
}

export default function AppLayout({ children, headerProps }: Props) {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div>
      <Header {...headerProps} />

      <main>{children}</main>

      {showTop && (
        <button
          type="button"
          onClick={() =>
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
          className="fixed bottom-10 right-6 z-50 rounded-full bg-[#28574E] w-8 h-8 text-white shadow-lg hover:bg-[#356b61]"
        >
          ↑
        </button>
      )}

      <Footer />
    </div>
  );
}