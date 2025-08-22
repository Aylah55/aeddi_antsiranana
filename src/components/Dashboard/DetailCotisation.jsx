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
    <>
      <h3 className="text-xl font-bold mb-4">{cotisation.nom}</h3>
      <p className="mb-2"><span className="font-semibold">Description :</span> {cotisation.description || 'Aucune'}</p>
      <p className="mb-2"><span className="font-semibold">Montant :</span> {formatMontant(cotisation.montant)}</p>
      <p className="mb-2"><span className="font-semibold">Date de début :</span> {new Date(cotisation.date_debut).toLocaleString('fr-FR')}</p>
      <p className="mb-2"><span className="font-semibold">Date de fin :</span> {new Date(cotisation.date_fin).toLocaleString('fr-FR')}</p>
      <p className="mb-2">
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
    </>
  );
};

export default DetailCotisation; 