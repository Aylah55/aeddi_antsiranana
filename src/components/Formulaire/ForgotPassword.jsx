import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../contextes/UrlContext';

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
            const res = await fetch(`${API_URL}/api/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Erreur lors de l\'envoi du mail');
            }
            setEmail('');
            setSuccess(data.message || 'Mail de récupération envoyé avec succès');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-center">Mot de passe oublié</h1>
                <p className="mb-4 text-center text-gray-700">Veuillez saisir votre adresse e-mail. Vous recevrez par e-mail un lien pour créer un nouveau mot de passe.</p>
                {error && <p className="text-red-600 mb-2 text-center">{error}</p>}
                {success && <p className="text-green-600 mb-2 text-center">{success}</p>}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                        type="email"
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Entrez votre email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-3 rounded transition-colors"
                    disabled={loading}
                >
                    {loading ? 'Envoi...' : 'Obtenir un nouveau mot de passe'}
                </button>
                <div className="text-center mt-6">
                    <button type="button" onClick={onBack} className="bg-[#f5848c] text-white px-6 py-2 rounded hover:bg-pink-400 transition">
                        Se connecter
                    </button>
                </div>
            </form>
        </div>
    );
} 