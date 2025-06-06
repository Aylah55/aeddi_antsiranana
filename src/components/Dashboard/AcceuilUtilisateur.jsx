import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, DollarSign, Users, Calendar } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Enregistrer les composants Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const AcceuilUtilisateur = () => {
    const [stats, setStats] = useState({
        membres: {
            total: 0,
            bureau: 0,
            membres: 0
        },
        cotisations: {
            total: 0,
            payees: 0,
            enCours: 0,
            aPayer: 0,
            montantTotal: 0,
            montantPaye: 0
        },
        activites: {
            total: 0,
            enCours: 0,
            aVenir: 0
        }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const axiosInstance = axios.create({
        baseURL: 'http://localhost:8000/api',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [usersResponse, cotisationsResponse, activitesResponse] = await Promise.all([
                axiosInstance.get('/users'),
                axiosInstance.get('/cotisations'),
                axiosInstance.get('/activites')
            ]);

            // Traitement des données des membres
            const users = usersResponse.data.users || [];
            console.log('Users data:', users); // Debug log
            
            const membresStats = {
                total: users.length,
                bureau: users.filter(user => 
                    user.role === 'President' || user.role === 'Membre de bureau'
                ).length,
                membres: users.filter(user => user.role === 'Membre').length
            };
            console.log('Membres stats:', membresStats); // Debug log

            // Traitement des données des cotisations
            const cotisations = Array.isArray(cotisationsResponse.data) ? cotisationsResponse.data :
                              Array.isArray(cotisationsResponse.data.data) ? cotisationsResponse.data.data : [];
            
            const cotisationsStats = {
                total: cotisations.length,
                payees: cotisations.filter(c => c.status === 'Payé').length,
                enCours: cotisations.filter(c => c.status === 'En cours').length,
                aPayer: cotisations.filter(c => c.status === 'À payer').length,
                montantTotal: cotisations.reduce((acc, c) => acc + parseFloat(c.montant || 0), 0),
                montantPaye: cotisations
                    .filter(c => c.status === 'Payé')
                    .reduce((acc, c) => acc + parseFloat(c.montant || 0), 0)
            };

            // Traitement des données des activités
            const activites = Array.isArray(activitesResponse.data) ? activitesResponse.data :
                            Array.isArray(activitesResponse.data.data) ? activitesResponse.data.data : [];
            
            const activitesStats = {
                total: activites.length,
                enCours: activites.filter(a => a.status === 'En cours').length,
                aVenir: activites.filter(a => a.status === 'À venir').length
            };

            setStats({
                membres: membresStats,
                cotisations: cotisationsStats,
                activites: activitesStats
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
            setError("Une erreur est survenue lors du chargement des données.");
        } finally {
            setIsLoading(false);
        }
    };

    const formatMontant = (montant) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'MGA'
        }).format(montant);
    };

    // Configuration des graphiques
    const membersChartData = {
        labels: ['Bureau', 'Membres'],
        datasets: [
            {
                data: [stats.membres.bureau, stats.membres.membres],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const cotisationsChartData = {
        labels: ['Payées', 'En cours', 'À payer'],
        datasets: [
            {
                label: 'Nombre de cotisations',
                data: [
                    stats.cotisations.payees,
                    stats.cotisations.enCours,
                    stats.cotisations.aPayer
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Erreur!</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête avec les statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Carte des membres */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Total Membres</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.membres.total}</h3>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-between text-sm">
                        <span className="text-gray-600">Bureau: {stats.membres.bureau}</span>
                        <span className="text-gray-600">Membres: {stats.membres.membres}</span>
                    </div>
                </div>

                {/* Carte des cotisations */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Cotisations</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.cotisations.total}</h3>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Payées: {stats.cotisations.payees}</span>
                            <span className="text-gray-600">En cours: {stats.cotisations.enCours}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            À payer: {stats.cotisations.aPayer}
                        </div>
                    </div>
                </div>

                {/* Carte des activités */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Activités</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.activites.total}</h3>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                            <Calendar className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-between text-sm">
                        <span className="text-gray-600">En cours: {stats.activites.enCours}</span>
                        <span className="text-gray-600">À venir: {stats.activites.aVenir}</span>
                    </div>
                </div>

                {/* Carte des montants */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Montants</p>
                            <h3 className="text-xl font-bold text-gray-800">{formatMontant(stats.cotisations.montantTotal)}</h3>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <BarChart className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm text-gray-600">
                            Payé: {formatMontant(stats.cotisations.montantPaye)}
                        </p>
                        <p className="text-sm text-gray-600">
                            Restant: {formatMontant(stats.cotisations.montantTotal - stats.cotisations.montantPaye)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graphique des membres */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Répartition des membres</h3>
                    <div className="h-64">
                        <Pie data={membersChartData} options={pieOptions} />
                    </div>
                </div>

                {/* Graphique des cotisations */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">État des cotisations</h3>
                    <div className="h-64">
                        <Bar data={cotisationsChartData} options={barOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcceuilUtilisateur; 