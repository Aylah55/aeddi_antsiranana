import React from 'react';

const galerie = [
  {
    url: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80',
    legende: 'Travailler avec ses camarades',
    explication: "Le travail en groupe permet de s'entraider, de partager ses connaissances et de progresser plus rapidement."
  },
  {
    url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
    legende: 'Comprendre les difficultés ensemble',
    explication: "Discuter des points difficiles avec d'autres étudiants aide à lever les blocages et à trouver des solutions ensemble."
  },
  {
    url: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=800&q=80',
    legende: 'Partage de ressources',
    explication: "Les membres d'un cercle d'étude partagent leurs cours, exercices et astuces pour réussir."
  },
  {
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    legende: 'Ambiance conviviale',
    explication: "Étudier dans une ambiance détendue et amicale rend l'apprentissage plus agréable et moins stressant."
  },
  {
    url: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80',
    legende: 'Réussite collective',
    explication: "La réussite de chacun profite à tout le groupe : on avance ensemble vers la réussite."
  },
  {
    url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
    legende: 'Soutien et motivation',
    explication: "Le cercle d'étude motive à travailler régulièrement et à ne pas abandonner face aux difficultés."
  },
];

const CercleEtude = ({ data }) => {
  if (!data) return <div>Aucune donnée à afficher.</div>;
  return (
    <div className="bg-white rounded-3xl shadow-xl p-0 flex flex-col items-center w-full h-full">
      {/* Introduction */}
      <div className="mb-8 w-full px-8 pt-8">
        <h2 className="text-3xl font-bold text-blue-700 mb-4 text-center">Cercle d'étude</h2>
        <p className="text-gray-700 text-center text-lg">
          Les cercles d'étude sont essentiels pour progresser, partager ses difficultés, s'entraider et réussir ensemble.<br/>
          Rejoindre un cercle, c'est avancer plus vite et ne jamais rester seul face aux obstacles !<br/>
          Découvrez ci-dessous les différents aspects qui rendent un cercle d'étude si précieux pour votre réussite.
        </p>
      </div>
      {/* Galerie verticale façon "PDF" */}
      <div className="w-full px-6 pb-10">
        {galerie.map((img, idx) => (
          <div key={idx} className="mb-10">
            <div className="w-full h-72 md:h-80 lg:h-[28rem] rounded-2xl overflow-hidden shadow-lg mb-3">
              <img src={img.url} alt={img.legende} className="w-full h-full object-cover" />
            </div>
            <div className="text-xl font-semibold text-blue-700 mb-1 text-center">{img.legende}</div>
            <div className="text-gray-600 text-base text-center mb-2">{img.explication}</div>
          </div>
        ))}
      </div>
      {/* Détails du cercle */}
      <div className="w-full px-8 pb-8">
        <h3 className="text-xl font-semibold text-blue-700 mb-1">{data.nom}</h3>
        <p className="text-gray-600 text-center mb-4">{data.description}</p>
        <div className="w-full">
          <h4 className="text-md font-semibold text-gray-800 mb-1">Membres :</h4>
          <ul className="flex flex-wrap gap-2 justify-center">
            {data.membres?.map((m, i) => (
              <li key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">{m}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CercleEtude;
