"use client";

import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { useEffect, useState } from "react";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";

const images = [
  "/images/school1.jpg",
  "/images/school2.jpg",
//   "/images/school3.jpg",
//   "/images/school4.jpg",
];

export default function SchoolGallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      slides: {
        perView: 2,
        spacing: 15,
      },
      mode: "free-snap",
      dragSpeed: 0.5,
    }
  );

  // Autoplay slider
  useEffect(() => {
    if (!instanceRef.current) return;

    const interval = setInterval(() => {
      instanceRef.current?.next();
    }, 2500); // autoplay every 2.5s

    return () => clearInterval(interval);
  }, [instanceRef]);

  return (
    <>
      <div ref={sliderRef} className="keen-slider">
        {images.map((src, i) => (
          <div key={i} className="keen-slider__slide number-slide">
            <img
              src={src}
              alt={`School ${i + 1}`}
              onClick={() => setLightboxIndex(i)}
              className="rounded-xl shadow-lg object-cover w-full h-48 cursor-pointer hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          mainSrc={images[lightboxIndex]}
          nextSrc={images[(lightboxIndex + 1) % images.length]}
          prevSrc={images[(lightboxIndex + images.length - 1) % images.length]}
          onCloseRequest={() => setLightboxIndex(null)}
          onMovePrevRequest={() =>
            setLightboxIndex(
              (lightboxIndex + images.length - 1) % images.length
            )
          }
          onMoveNextRequest={() =>
            setLightboxIndex((lightboxIndex + 1) % images.length)
          }
        />
      )}
    </>
  );
}
