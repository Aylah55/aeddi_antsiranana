import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';

function Login({ onSwitch }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await loginUser({ email, password });
            // Enregistrer le token et les infos utilisateur
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Vérifier si l'utilisateur est un administrateur
            if (response.data.user.role === 'admin') {
                navigate('/administrateur');
            } else {
                navigate('/dashbord');
            }
        } catch (err) {
            setError('Email ou mot de passe incorrect');
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gray-50">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 border-2 border-transparent hover:border-blue-200 transition-all duration-300">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Connexion</h2>
                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-500 text-sm rounded-md text-center">
                    {error}
                </div>}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 shadow-md"
                    >
                        Se connecter
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Vous n'avez pas de compte ?{' '}
                    <span
                        onClick={onSwitch}
                        className="text-blue-600 font-medium hover:text-blue-800 cursor-pointer underline transition-colors"
                    >
                        Inscrivez-vous ici
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Login;
