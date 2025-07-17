import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_URL } from '../../contextes/UrlContext';

export default function CreatePassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const token = params.get('token');
  const email = params.get('email');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !token) {
      setError("Impossible de récupérer l'email ou le token.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token,
          password,
          password_confirmation: confirm,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      alert('Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Erreur inconnue.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Créer un mot de passe</h2>
      {error && <p className="text-red-600 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email || ''}
          readOnly
          className="w-full p-2 border rounded bg-gray-100"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
}
