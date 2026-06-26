import { useEffect, useRef } from "react";
import parallaxImg from "../images/imgparallax1.png";

export default function HeroBanner() {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Parallax solo en escritorio para evitar recortes en móvil
    const isMobile = () => window.innerWidth < 768;

    const handleScroll = () => {
      if (imgRef.current && !isMobile()) {
        imgRef.current.style.transform = `translateY(${window.scrollY * 0.3}px)`;
      } else if (imgRef.current) {
        imgRef.current.style.transform = "none";
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="w-full overflow-hidden">
      <img
        ref={imgRef}
        src={parallaxImg}
        alt="Promoción Mr. Sushi"
        className="w-full block will-change-transform"
        style={{ display: "block", maxWidth: "100%" }}
      />
    </section>
  );
}
