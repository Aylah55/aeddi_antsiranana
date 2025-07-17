import React from 'react';

const formatMontant = (montant) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MGA'
  }).format(montant);
};

const DetailCotisation = ({ cotisation, onBack }) => {
  if (!cotisation) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{cotisation.nom}</h2>
        {onBack && (
          <button
            onClick={onBack}
            className="text-blue-600 hover:underline text-sm"
          >
            Retour à la liste
          </button>
        )}
      </div>
      <div className="space-y-3">
        <p><span className="font-semibold">Description :</span> {cotisation.description || 'Aucune'}</p>
        <p><span className="font-semibold">Montant :</span> {formatMontant(cotisation.montant)}</p>
        <p><span className="font-semibold">Date de début :</span> {new Date(cotisation.date_debut).toLocaleString('fr-FR')}</p>
        <p><span className="font-semibold">Date de fin :</span> {new Date(cotisation.date_fin).toLocaleString('fr-FR')}</p>
        <p>
          <span className="font-semibold">Statut :</span>
          <span className={`ml-2 ${
            cotisation.statut_paiement === 'Payé'
              ? 'text-green-600'
              : cotisation.statut_paiement === 'Non payé'
              ? 'text-red-600'
              : cotisation.status === 'Payé'
              ? 'text-green-600'
              : cotisation.status === 'En cours'
              ? 'text-yellow-600'
              : 'text-red-600'
          }`}>
            {cotisation.statut_paiement || cotisation.status}
          </span>
        </p>
      </div>
    </div>
  );
};

export default DetailCotisation; 