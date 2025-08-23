import CercleEtude from './Formulaire/CercleEtude';
import Social from './Formulaire/Social';

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

export default function Avantages({ details, selectedCategory, setSelectedCategory }) {
  return (
    <>
      {selectedCategory === null ? (
        <div className="mt-6 -mx-0 md:-mx-4 lg:-mx-6">
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
      ) : (
        <div className="w-full h-full flex flex-col justify-center items-center">
          <button className="mb-4 text-blue-600 hover:underline self-start" onClick={() => setSelectedCategory(null)}>&larr; Retour</button>
          {selectedCategory === 'cercle' && <CercleEtude data={details.cercle} />}
          {selectedCategory === 'social' && <Social data={details.social} />}
          {selectedCategory === 'sport' && (
            <div className="bg-white rounded-3xl p-0 flex flex-col items-center w-full h-full">
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
            <div className="bg-white rounded-3xl p-0 flex flex-col items-center w-full h-full">
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
    </>
  );
}
