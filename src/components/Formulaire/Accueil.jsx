import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Connexion from './Connexion';
import ForgotPassword from './ForgotPassword';
import img1 from '../../assets/images/image1.jpg';
import img2 from '../../assets/images/image2.jpg';
import img3 from '../../assets/images/image3.jpg';

function Accueil() {
  const [currentImage, setCurrentImage] = useState(0);
  const [currentView, setCurrentView] = useState('connexion'); // 'connexion', 'forgot'
  const [isSwitching, setIsSwitching] = useState(false);
  const images = [img1, img2, img3];

  const nextImage = () => {
    setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleSwitch = (view) => {
    setIsSwitching(true);
    setTimeout(() => {
      setCurrentView(view);
      setIsSwitching(false);
    }, 300);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="flex flex-col-reverse lg:flex-row h-auto lg:h-screen">
      <div className="w-full lg:w-1/2 bg-gray-100 p-6 flex flex-col">
        <div className="relative h-[500px] rounded-xl overflow-hidden shadow-lg mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <img
                src={images[currentImage]}
                alt={`Slide ${currentImage}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
          <button
            onClick={prevImage}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/80 text-gray-800 p-2 rounded-full shadow hover:bg-white transition"
          >
            ‹
          </button>
          <button
            onClick={nextImage}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/80 text-gray-800 p-2 rounded-full shadow hover:bg-white transition"
          >
            ›
          </button>

          {/* Indicateurs */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${index === currentImage ? 'bg-white w-4' : 'bg-white/50'}`}
                onClick={() => setCurrentImage(index)}
              />
            ))}
          </div>
        </div>

        {/* Contenu texte */}
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Qui sommes-nous ?</h2>
          <p className="text-gray-600 mb-6 px-4">
            Associations des Etudiants Dynamiques de Diego AEDDI.
          </p>
          <div className="flex space-x-4">
            {['📱', '📧', '📞'].map((icon, i) => (
              <button key={i} className="text-2xl hover:scale-110 transition">
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Partie droite - Formulaire (50% de largeur) */}
      <div className="w-full lg:w-1/2 bg-white p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          {isSwitching ? (
            <div className="flex justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"
              />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentView === 'connexion' && (
                  <Connexion
                    onForgot={() => handleSwitch('forgot')}
                  />
                )}
                {currentView === 'forgot' && (
                  <ForgotPassword onBack={() => handleSwitch('connexion')} />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

export default Accueil;
