import parallaxImg from "../images/imgparallax1.png";

export default function HeroBanner() {
  return (
    <section className="w-full overflow-hidden">
      <img
        src={parallaxImg}
        alt="Promoción Mr. Sushi"
        className="block w-full"
        style={{ display: "block", maxWidth: "100%" }}
      />
    </section>
  );
}
