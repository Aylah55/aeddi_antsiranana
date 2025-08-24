import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from "lucide-react";
import Connexion from './Connexion';
import ForgotPassword from './ForgotPassword';
import CercleEtude from './CercleEtude';
import Social from './Social';
import Slider from '../../utils/Slider';
import Avantages from '../../utils/Avantages';

function Accueil() {
  const [currentView, setCurrentView] = useState('connexion');
  const [isSwitching, setIsSwitching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSwitch = (view) => {
    setIsSwitching(true);
    setTimeout(() => {
      setCurrentView(view);
      setIsSwitching(false);
    }, 300);
  };
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
        {!selectedCategory && (
          <div className="-mx-0 md:-mx-4 lg:-mx-6">
            <Slider />
          </div>
        )}
        {!selectedCategory && (
          <div className="flex flex-col justify-center items-center text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">Qui sommes-nous ?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4 px-4">Associations des Etudiants Dynamiques de Diego AEDDI.</p>
          </div>
        )}
        <Avantages
          details={details}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </div>
      {/* Partie droite - Formulaire (connexion/inscription) inchangée */}
      <div className={`w-full lg:w-1/2 bg-white p-0 md:p-4 lg:p-8 flex items-center justify-center${selectedCategory ? ' hidden lg:flex' : ''}`}>
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
