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

  // Images d'avantages (libres de droits)
  const avantages = [
    {
      titre: 'Cercle d’étude',
      image: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=400&q=80',
      icone: '📚',
      texte: 'Groupes d’étude, entraide et réussite académique.'
    },
    {
      titre: 'Sociale',
      image: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=400&q=80',
      icone: '🤝',
      texte: 'Rencontres, événements, vie associative riche.'
    },
    {
      titre: 'Sport',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
      icone: '⚽',
      texte: 'Tournois, activités sportives, esprit d’équipe.'
    },
    {
      titre: 'Logement',
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=400&q=80',
      icone: '🏠',
      texte: 'Aide au logement, réseau de solidarité.'
    },
  ];

  return (
    <div className="flex flex-col-reverse lg:flex-row h-auto lg:h-screen">
      <div className="w-full lg:w-1/2 bg-gray-100 p-6 flex flex-col">
        {/* Carousel d'images */}
        <div className="relative h-[320px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl mb-6 group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImage}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <img
                src={images[currentImage]}
                alt={`Slide ${currentImage}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Overlay dégradé */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </AnimatePresence>
          {/* Flèches customisées */}
          <button
            onClick={prevImage}
            className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/80 text-blue-600 p-2 rounded-full shadow-lg hover:bg-blue-100 hover:scale-110 transition-all"
            aria-label="Image précédente"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button
            onClick={nextImage}
            className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/80 text-blue-600 p-2 rounded-full shadow-lg hover:bg-blue-100 hover:scale-110 transition-all"
            aria-label="Image suivante"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
          </button>
          {/* Dots animés */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={`transition-all duration-300 w-3 h-3 rounded-full ${index === currentImage ? 'bg-blue-500 scale-125 shadow' : 'bg-white/60'}`}
                onClick={() => setCurrentImage(index)}
                aria-label={`Aller à l'image ${index + 1}`}
              />
            ))}
          </div>
        </div>
        {/* Qui sommes-nous ? juste en bas du carousel */}
        <div className="flex flex-col justify-center items-center text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Qui sommes-nous ?</h2>
          <p className="text-gray-600 mb-4 px-4">Associations des Etudiants Dynamiques de Diego AEDDI.</p>
          <div className="flex space-x-4 mb-2">
            {['📱', '📧', '📞'].map((icon, i) => (
              <button key={i} className="text-2xl hover:scale-110 transition">
                {icon}
              </button>
            ))}
          </div>
        </div>
        {/* Avantages */}
        <div className="mt-6">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 text-center">Nos grands avantages</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-6 md:overflow-x-visible">
            {avantages.map((av, idx) => (
              <div key={idx} className="min-w-[220px] md:min-w-0 bg-white rounded-2xl shadow-lg flex flex-col items-center p-4 transition hover:scale-105 hover:shadow-2xl cursor-pointer">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden mb-3 border-4 border-blue-100 flex items-center justify-center bg-blue-50">
                  <img src={av.image} alt={av.titre} className="w-full h-full object-cover" />
                </div>
                <div className="text-3xl mb-1">{av.icone}</div>
                <div className="font-bold text-lg text-blue-700 mb-1">{av.titre}</div>
                <div className="text-gray-500 text-sm text-center">{av.texte}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contenu texte */}
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          {/* The original "Qui sommes-nous ?" section was moved to the top */}
          {/* <h2 className="text-2xl font-bold text-gray-800 mb-4">Qui sommes-nous ?</h2> */}
          {/* <p className="text-gray-600 mb-6 px-4">
            Associations des Etudiants Dynamiques de Diego AEDDI.
          </p> */}
          {/* <div className="flex space-x-4">
            {['📱', '📧', '📞'].map((icon, i) => (
              <button key={i} className="text-2xl hover:scale-110 transition">
                {icon}
              </button>
            ))}
          </div> */}
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
