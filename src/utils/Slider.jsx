// components/Slider.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import img1 from '../assets/images/image1.jpg';
import img2 from '../assets/images/image2.jpg';
import img3 from '../assets/images/image3.jpg';
import img4 from '../assets/images/image4.jpg';
import img5 from '../assets/images/image5.jpg';
import img6 from '../assets/images/image6.jpg';

const images = [img1, img2, img3, img4, img5, img6];

export default function Slider() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % images.length);
    }, 10000); // 10 secondes
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="relative overflow-hidden w-full h-[250px] md:h-[350px] lg:h-[500px] rounded-3xl shadow-2xl">
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={current}
          src={images[current]}
          custom={direction}
          initial={{ x: direction > 0 ? "100%" : "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: direction > 0 ? "-100%" : "100%" }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
    </div>
  );
}
