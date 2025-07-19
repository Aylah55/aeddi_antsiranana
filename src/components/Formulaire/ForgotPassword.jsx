import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendResetPasswordEmail } from '../../services/api';

export default function ForgotPassword({ onBack }) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (email.trim() === '') {
            setError('Email obligatoire');
            return;
        }
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await sendResetPasswordEmail(email);
            const data = res.data;
            
            // Vérifier le statut de la réponse
            if (res.status === 200) {
                setEmail('');
                setSuccess(data.message || 'Email de réinitialisation envoyé avec succès.');
            } else {
                throw new Error(data.message || 'Erreur lors de l\'envoi du mail');
            }
        } catch (err) {
            console.error('Erreur ForgotPassword:', err);
            
            // Gérer les différents types d'erreurs
            if (err.response?.status === 404) {
                // Email non trouvé dans la base de données
                setError(err.response.data.message || 'Cet email n\'existe pas dans notre base de données.');
            } else if (err.response?.status === 400) {
                // Erreur spécifique (comme compte Google sans mot de passe)
                setError(err.response.data.message || 'Erreur lors de l\'envoi du mail');
            } else {
                // Erreur générique
                setError(err.message || 'Erreur lors de l\'envoi du mail. Veuillez réessayer.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-center">Mot de passe oublié</h1>
                <p className="mb-4 text-center text-gray-700">
                    Veuillez saisir votre adresse e-mail. Vous recevrez par e-mail un lien pour créer un nouveau mot de passe.
                </p>
                
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                        <p className="text-sm">{success}</p>
                    </div>
                )}
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                        type="email"
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Entrez votre email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                
                <button
                    type="submit"
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? 'Envoi...' : 'Obtenir un nouveau mot de passe'}
                </button>
                
                <div className="text-center mt-6">
                    <button 
                        type="button" 
                        onClick={onBack} 
                        className="bg-[#f5848c] text-white px-6 py-2 rounded hover:bg-pink-400 transition"
                        disabled={loading}
                    >
                        Se connecter
                    </button>
                </div>
                
                <div className="mt-4 text-xs text-gray-500 text-center">
                    <p>💡 <strong>Conseil :</strong> Si vous utilisez Google pour vous connecter, utilisez plutôt la connexion Google.</p>
                </div>
            </form>
        </div>
    );
} 