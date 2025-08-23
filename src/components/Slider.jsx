// components/Slider.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Slider({ images }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % images.length);
    }, 10000); // 10 secondes
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative overflow-hidden w-full h-[500px] rounded-3xl shadow-2xl">
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
