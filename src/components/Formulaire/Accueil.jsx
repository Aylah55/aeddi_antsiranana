import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from "lucide-react";
import Connexion from './Connexion';
import ForgotPassword from './ForgotPassword';
import CercleEtude from './CercleEtude';
import Social from './Social';
import img1 from '../../assets/images/image1.jpg';
import img2 from '../../assets/images/image2.jpg';
import img3 from '../../assets/images/image3.jpg';
import img4 from '../../assets/images/image4.jpg';
import img5 from '../../assets/images/image5.jpg';
import img6 from '../../assets/images/image6.jpg';

function Accueil() {
  const [[currentImage, direction], setCurrentImage] = useState([0, 0]);
  const [currentView, setCurrentView] = useState('connexion');
  const [isSwitching, setIsSwitching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const images = [img1, img2, img3, img4, img5, img6];
  const nextImage = () => {
    setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
  };

  const paginate = (newDirection) => {
    setCurrentImage(([prevIndex]) => {
      let newIndex = (prevIndex + newDirection + images.length) % images.length;
      return [newIndex, newDirection];
    });
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
      paginate(1);
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

  // Données détaillées fictives pour chaque catégorie
  const details = {
    cercle: {
      nom: "Cercle d'étude",
      description: "Un groupe d'entraide pour progresser en mathématiques.",
      membres: ["Alice", "Bob", "Charlie"],
      image: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=400&q=80'
    },
    social: {
      nom: "Soirée d'intégration",
      description: "Un événement pour rencontrer les nouveaux membres.",
      date: "2024-06-15",
      image: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=400&q=80'
    },
    sport: {
      nom: "Tournoi de foot",
      description: "Compétition amicale entre étudiants.",
      date: "2024-07-01",
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80'
    },
    logement: {
      nom: "Aide au logement",
      description: "Conseils et réseau pour trouver un logement étudiant.",
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=400&q=80'
    }
  };
  return (
    <div className="flex flex-col-reverse lg:flex-row h-auto lg:h-screen">
      <div className="w-full lg:w-1/2 bg-gray-100 p-0 md:p-4 lg:p-6 flex flex-col h-full min-h-0 overflow-y-auto">
        {selectedCategory === null ? (
          <>
            {/* Carousel d'images */}
            <div className="relative w-full h-full overflow-hidden">
              <AnimatePresence initial={false} custom={direction}>
                <motion.img
                  key={currentImage}
                  src={images[currentImage]}
                  alt={`Slide ${currentImage}`}
                  custom={direction}
                  initial={{ x: direction > 0 ? "100%" : "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: direction > 0 ? "-100%" : "100%" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </AnimatePresence>

              {/* Boutons gauche/droite */}
              <button
                onClick={() => paginate(-1)}
                className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/70"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => paginate(1)}
                className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/70"
              >
                <ChevronRight size={24} />
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`transition-all duration-300 w-3 h-3 rounded-full ${index === currentImage
                        ? "bg-blue-500 scale-125 shadow"
                        : "bg-white/60"
                      }`}
                    onClick={() =>
                      setCurrentImage([index, index > currentImage ? 1 : -1])
                    }
                  />
                ))}
              </div>
            </div>

            {/* Qui sommes-nous ? juste en bas du carousel */}
            <div className="flex flex-col justify-center items-center text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">Qui sommes-nous ?</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4 px-4">Associations des Etudiants Dynamiques de Diego AEDDI.</p>
            </div>
            {/* Avantages */}
            <div className="mt-6">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 text-center">Nos grands avantages</h3>
              <div className="flex gap-6 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory">
                {avantages.map((av, idx) => (
                  <div
                    key={idx}
                    className="min-w-[260px] md:min-w-[320px] bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col items-center p-1 transition hover:scale-105 hover:shadow-2xl cursor-pointer snap-start border border-gray-200 dark:border-gray-700"
                    onClick={() => {
                      if (av.titre.toLowerCase().includes('cercle')) setSelectedCategory('cercle');
                      else if (av.titre.toLowerCase().includes('social')) setSelectedCategory('social');
                      else if (av.titre.toLowerCase().includes('sport')) setSelectedCategory('sport');
                      else if (av.titre.toLowerCase().includes('logement')) setSelectedCategory('logement');
                    }}
                  >
                    <div className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-22 rounded-2xl overflow-hidden mb-2 border-4 border-blue-100 flex items-center justify-center bg-blue-50">
                      <img src={av.image} alt={av.titre} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-2xl mb-1">{av.icone}</div>
                    <div className="font-semibold text-base text-blue-700 mb-1 text-center">{av.titre}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs text-center px-2">{av.texte}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center">
            <button className="mb-4 text-blue-600 hover:underline self-start" onClick={() => setSelectedCategory(null)}>&larr; Retour</button>
            {selectedCategory === 'cercle' && <CercleEtude data={details.cercle} />}
            {selectedCategory === 'social' && <Social data={details.social} />}
            {selectedCategory === 'sport' && (
              <div className="bg-white rounded-3xl shadow-xl p-0 flex flex-col items-center w-full h-full">
                <div className="mb-8 w-full px-8 pt-8">
                  <h2 className="text-3xl font-bold text-green-700 mb-4 text-center">Activités sportives</h2>
                  <p className="text-gray-700 text-center text-lg">
                    Le sport est un excellent moyen de se défouler, de renforcer l'esprit d'équipe et de rester en bonne santé.<br />
                    Les activités sportives organisées par l'association favorisent la cohésion et la motivation de tous.<br />
                    Découvrez ci-dessous les différents aspects du sport en association !
                  </p>
                </div>
                {/* Galerie verticale sport */}
                <div className="w-full px-4 pb-8" style={{ maxWidth: 700 }}>
                  {[
                    {
                      url: details.sport.image,
                      legende: 'Tournoi de foot',
                      explication: "Les tournois sportifs créent une ambiance compétitive et amicale, où chacun peut se dépasser."
                    },
                    {
                      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
                      legende: 'Esprit d’équipe',
                      explication: "Le sport développe la solidarité, l'entraide et la confiance entre les membres."
                    },
                    {
                      url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',
                      legende: 'Bien-être physique',
                      explication: "Pratiquer une activité physique régulière améliore la santé et réduit le stress."
                    },
                  ].map((img, idx) => (
                    <div key={idx} className="mb-10">
                      <div className="w-full h-72 md:h-[24rem] lg:h-[28rem] rounded-2xl overflow-hidden shadow-lg mb-3">
                        <img src={img.url} alt={img.legende} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-xl font-semibold text-green-700 mb-1 text-center">{img.legende}</div>
                      <div className="text-gray-600 text-base text-center mb-2">{img.explication}</div>
                    </div>
                  ))}
                </div>
                {/* Détails sport */}
                <div className="w-full px-8 pb-8">
                  <h3 className="text-xl font-semibold text-green-700 mb-1">{details.sport.nom}</h3>
                  <p className="text-gray-600 text-center mb-4">{details.sport.description}</p>
                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm mb-2">Date : {details.sport.date}</span>
                </div>
              </div>
            )}
            {selectedCategory === 'logement' && (
              <div className="bg-white rounded-3xl shadow-xl p-0 flex flex-col items-center w-full h-full">
                <div className="mb-8 w-full px-8 pt-8">
                  <h2 className="text-3xl font-bold text-yellow-700 mb-4 text-center">Aide au logement</h2>
                  <p className="text-gray-700 text-center text-lg">
                    Trouver un logement étudiant peut être un vrai défi. L'association propose un accompagnement et des conseils pour faciliter cette étape.<br />
                    Découvrez ci-dessous les différents aspects de l'aide au logement !
                  </p>
                </div>
                {/* Galerie verticale logement */}
                <div className="w-full px-4 pb-8" style={{ maxWidth: 700 }}>
                  {[
                    {
                      url: details.logement.image,
                      legende: 'Réseau de solidarité',
                      explication: "Profitez du réseau de l’association pour trouver plus facilement un logement."
                    },
                    {
                      url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80',
                      legende: 'Conseils pratiques',
                      explication: "Des astuces et des conseils pour bien choisir son logement et éviter les pièges."
                    },
                    {
                      url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
                      legende: 'Accompagnement personnalisé',
                      explication: "L’association accompagne chaque étudiant dans ses démarches administratives."
                    },
                  ].map((img, idx) => (
                    <div key={idx} className="mb-10">
                      <div className="w-full h-72 md:h-[24rem] lg:h-[28rem] rounded-2xl overflow-hidden shadow-lg mb-3">
                        <img src={img.url} alt={img.legende} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-xl font-semibold text-yellow-700 mb-1 text-center">{img.legende}</div>
                      <div className="text-gray-600 text-base text-center mb-2">{img.explication}</div>
                    </div>
                  ))}
                </div>
                {/* Détails logement */}
                <div className="w-full px-8 pb-8">
                  <h3 className="text-xl font-semibold text-yellow-700 mb-1">{details.logement.nom}</h3>
                  <p className="text-gray-600 text-center mb-4">{details.logement.description}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Partie droite - Formulaire (connexion/inscription) inchangée */}
      <div className="w-full lg:w-1/2 bg-white p-0 md:p-4 lg:p-8 flex items-center justify-center">
        <div className="w-full">
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
                  <Connexion onForgot={() => handleSwitch('forgot')} />
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
