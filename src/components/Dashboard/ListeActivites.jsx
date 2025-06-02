import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Eye } from 'lucide-react'; // icône "voir" (via Lucide)

const ListeActivites = () => {
    const [activites, setActivites] = useState([]);
    const [erreur, setErreur] = useState(null);
    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:8000/api/activites')
            .then(response => setActivites(response.data))
            .catch(error => {
                console.error('Erreur :', error);
                setErreur("Impossible de charger les activités.");
            });
    }, []);

    const openModal = (item) => {
        setSelected(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelected(null);
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Liste des Activités & Cotisations</h2>
            {erreur && <p className="text-red-500">{erreur}</p>}

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2">Nom</th>
                            <th className="px-4 py-2">Type</th>
                            <th className="px-4 py-2">Montant</th>
                            <th className="px-4 py-2">Dates</th>
                            <th className="px-4 py-2">Statut</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activites.map(item => (
                            <tr key={item.id} className="border-t">
                                <td className="px-4 py-2 font-semibold">{item.nom}</td>
                                <td className="px-4 py-2">{item.type}</td>
                                <td className="px-4 py-2">{item.montant ?? '-'}</td>
                                <td className="px-4 py-2">{item.date_debut} → {item.date_fin}</td>
                                <td className="px-4 py-2 text-green-600">{item.status}</td>
                                <td className="px-4 py-2">
                                    <button
                                        className="text-blue-600 hover:text-blue-800"
                                        onClick={() => openModal(item)}
                                    >
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODALE */}
            {showModal && selected && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
                        >
                            ×
                        </button>
                        <h3 className="text-lg font-bold mb-4">Détails de {selected.nom}</h3>
                        <p><strong>Type:</strong> {selected.type}</p>
                        <p><strong>Description:</strong> {selected.description || "Aucune"}</p>
                        <p><strong>Montant:</strong> {selected.montant ?? "Non défini"}</p>
                        <p><strong>Date début:</strong> {selected.date_debut}</p>
                        <p><strong>Date fin:</strong> {selected.date_fin}</p>
                        <p><strong>Statut:</strong> {selected.status}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListeActivites;
