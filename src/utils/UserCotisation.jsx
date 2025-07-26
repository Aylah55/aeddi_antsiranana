import React from 'react';
import { FiX } from 'react-icons/fi';

const UserCotisation = ({ user, cotisations, onClose, loading, onUpdatePaiement }) => {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Cotisations de {user?.prenom} {user?.nom}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <FiX size={24} />
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date début</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date fin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut paiement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cotisations?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Aucune cotisation trouvée pour cet utilisateur
                  </td>
                </tr>
              ) : (
                cotisations.map(cotisation => (
                  <tr key={cotisation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cotisation.nom}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA' }).format(cotisation.montant)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(cotisation.date_debut).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(cotisation.date_fin).toLocaleDateString('fr-FR')}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${cotisation.statut_paiement === 'Payé' ? 'text-green-600' : 'text-red-600'}`}>{cotisation.statut_paiement}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => onUpdatePaiement(cotisation.id, user.id, cotisation.statut_paiement === 'Payé' ? 'Non payé' : 'Payé')}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${cotisation.statut_paiement === 'Payé' ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                      >
                        {cotisation.statut_paiement === 'Payé' ? 'Marquer comme non payé' : 'Marquer comme payé'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserCotisation;
