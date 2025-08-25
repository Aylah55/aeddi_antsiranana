import React from 'react';

const galerie = [
  {
    url: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=800&q=80',
    legende: 'Créer des liens',
    explication: "Les activités sociales permettent de rencontrer de nouvelles personnes et de tisser des liens d'amitié durables."
  },
  {
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    legende: 'Ambiance festive',
    explication: "Les événements organisés favorisent la bonne humeur, la détente et la convivialité. Découvrez un extrait musical ainsi que la sortie de promotion THE BEST 2024, qui a animé la plage de Ramena à Diego-Suarez."
  },
  {
    url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
    legende: 'Soutien moral',
    explication: "Être entouré, c'est aussi pouvoir compter sur les autres dans les moments difficiles."
  },
  {
    url: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80',
    legende: 'Découverte culturelle',
    explication: "Les activités sociales sont l'occasion de découvrir de nouvelles cultures, traditions et passions."
  },
  {
    url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
    legende: 'Partage et entraide',
    explication: "Les échanges lors des activités sociales favorisent l'entraide et le partage d'expériences."
  },
];

const Social = ({ data }) => {
  if (!data) return <div>Aucune donnée à afficher.</div>;
  return (
    <div className="bg-white rounded-3xl shadow-xl p-0 flex flex-col items-center w-full h-full">
      {/* Introduction */}
      <div className="mb-8 w-full px-8 pt-8">
        <h2 className="text-3xl font-bold text-pink-600 mb-4 text-center">Activités sociales</h2>
        <p className="text-gray-700 text-center text-lg">
          Les activités sociales sont essentielles pour s'intégrer, se détendre et s'épanouir au sein de l'association.<br/>
          Elles permettent de créer des souvenirs inoubliables et de renforcer la cohésion du groupe.<br/>
          Découvrez ci-dessous les différents aspects qui rendent la vie sociale si enrichissante !
        </p>
      </div>
      {/* Galerie verticale façon "PDF" */}
      <div className="w-full px-6 pb-10">
        {galerie.map((img, idx) => (
          <div key={idx} className="mb-10">
            <div className="w-full h-72 md:h-80 lg:h-[28rem] rounded-2xl overflow-hidden shadow-lg mb-3">
              {img.legende === 'Ambiance festive' ? (
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/oR9TYQApFrg?si=B9_hvpspnPudCzcz"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  style={{ minHeight: '100%', minWidth: '100%' }}
                />
              ) : (
                <img src={img.url} alt={img.legende} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="text-xl font-semibold text-pink-600 mb-1 text-center">{img.legende}</div>
            <div className="text-gray-600 text-base text-center mb-2">{img.explication}</div>
          </div>
        ))}
      </div>
      {/* Détails de l'activité sociale */}
      <div className="w-full px-8 pb-8">
        <h3 className="text-xl font-semibold text-pink-600 mb-1">{data.nom}</h3>
        <p className="text-gray-600 text-center mb-4">{data.description}</p>
        <div className="w-full flex flex-col items-center">
          <span className="bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm mb-2">Date : {data.date}</span>
        </div>
      </div>
    </div>
  );
};

export default Social;
