import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { setPassword } from '../../services/api';
import { API_URL } from '../../services/api';

export default function CreatePassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [password, setPasswordState] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  // Récupérer les informations utilisateur depuis localStorage ou URL
  useEffect(() => {
    console.log('=== CreatePassword Component Mounted ===');
    console.log('Current URL:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    console.log('Search params:', window.location.search);

    const userData = localStorage.getItem('user');
    const token = searchParams.get('token');
    const userId = searchParams.get('user_id');
    const userDataEncoded = searchParams.get('user_data');
    const email = searchParams.get('email');
    const newUserParam = searchParams.get('new_user');

    console.log('CreatePassword - UserData localStorage:', userData ? 'Présent' : 'Manquant');
    console.log('CreatePassword - Token URL:', token ? 'Présent' : 'Manquant');
    console.log('CreatePassword - UserId URL:', userId);
    console.log('CreatePassword - UserData URL:', userDataEncoded ? 'Présent' : 'Manquant');
    console.log('CreatePassword - Email URL:', email);
    console.log('CreatePassword - New User:', newUserParam);
    console.log('API_URL:', process.env.REACT_APP_API_URL_PROD || 'Non défini');

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsNewUser(newUserParam === 'true' || parsedUser.provider === 'google');
        console.log('Utilisateur chargé depuis localStorage:', parsedUser);
        setIsLoading(false);
      } catch (err) {
        console.error('Erreur parsing user data:', err);
        setError("Erreur lors du chargement des données utilisateur.");
        setIsLoading(false);
      }
    } else if (token && userDataEncoded) {
      // Décoder les données utilisateur transmises dans l'URL (base64)
      try {
        const decodedData = atob(userDataEncoded);
        console.log('Données décodées (raw):', decodedData);

        const user = JSON.parse(decodedData);
        console.log('Utilisateur décodé depuis URL:', user);

        setUser(user);
        setIsNewUser(newUserParam === 'true' || user.provider === 'google');

        // Stocker le token dans localStorage
        localStorage.setItem('auth_token', token);

        setIsLoading(false);
      } catch (decodeError) {
        console.error('Erreur lors du décodage des données utilisateur:', decodeError);
        setError("Erreur lors du décodage des données utilisateur.");
        setIsLoading(false);
      }
    } else if (token && userId) {
      // Récupérer les données utilisateur depuis le cache via l'API
      fetch(`${API_URL}/api/temp-user-data/${userId}`)
        .then(response => {
          console.log('Réponse API temp-user-data - Status:', response.status);
          return response.json();
        })
        .then(data => {
          console.log('Données utilisateur reçues:', data);

          if (data.status === 'success' && data.user) {
            const user = data.user;
            console.log('Utilisateur récupéré depuis le cache:', user);

            setUser(user);
            setIsNewUser(newUserParam === 'true' || user.provider === 'google');

            // Stocker le token dans localStorage
            localStorage.setItem('auth_token', token);

            setIsLoading(false);
          } else {
            throw new Error(data.message || 'Aucune information utilisateur trouvée');
          }
        })
        .catch(err => {
          console.error('Erreur lors de la récupération des données utilisateur:', err);

          // Fallback vers un utilisateur minimal
          const tempUser = {
            id: userId,
            email: email || 'utilisateur@google.com',
            nom: 'Utilisateur',
            prenom: 'Utilisateur',
            provider: 'google'
          };

          setUser(tempUser);
          setIsNewUser(newUserParam === 'true');
          localStorage.setItem('auth_token', token);

          console.log('Utilisateur minimal créé:', tempUser);
          setIsLoading(false);
        });
    } else if (token && email) {
      // Si pas d'utilisateur dans localStorage mais token/email dans URL
      const tempUser = {
        email: email,
        nom: 'Utilisateur',
        prenom: 'Utilisateur',
        provider: 'google'
      };
      setUser(tempUser);
      setIsNewUser(newUserParam === 'true');
      console.log('Utilisateur temporaire créé depuis URL:', tempUser);
      setIsLoading(false);
    } else {
      setError("Aucune information utilisateur trouvée. Veuillez vous reconnecter.");
      setIsLoading(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user || !user.email) {
      setError("Impossible de récupérer l'email de l'utilisateur.");
      setLoading(false);
      return;
    }

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      setLoading(false);
      return;
    }

    try {
      const response = await setPassword({
        email: user.email,
        password: password,
        password_confirmation: confirm
      });

      if (response.data) {
        // Après création du mot de passe, login automatique
        try {
          const loginRes = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, password })
          });
          const loginData = await loginRes.json();
          if (loginData.token) {
            localStorage.setItem('auth_token', loginData.token);
            localStorage.setItem('user', JSON.stringify(loginData.user));
            navigate('/dashbord', { replace: true });
          } else {
            setError("Mot de passe changé, mais connexion automatique impossible. Merci de vous connecter manuellement.");
            navigate('/connexion');
          }
        } catch (e) {
          setError("Mot de passe changé, mais connexion automatique impossible. Merci de vous connecter manuellement.");
          navigate('/connexion');
        }
      }
    } catch (err) {
      console.error('Erreur lors de la création du mot de passe:', err);
      setError(err.response?.data?.message || 'Erreur lors de la création du mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded shadow">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  // Afficher l'erreur si pas d'utilisateur
  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded shadow">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/connexion')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {isNewUser ? 'Bienvenue ! Créez votre mot de passe' : 'Créer votre mot de passe'}
      </h2>

      {isNewUser ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">
            <strong>Bienvenue {user.prenom} !</strong> Pour finaliser votre inscription,
            créez un mot de passe pour votre compte. Vous pourrez ensuite vous connecter
            avec votre email et ce mot de passe.
          </p>
        </div>
      ) : (
        <p className="text-gray-600 text-center mb-6">
          Bienvenue {user.prenom} ! Créez un mot de passe pour votre compte.
        </p>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={user.email || ''}
            readOnly
            className="w-full p-3 border rounded bg-gray-100 text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
          <input
            type="password"
            placeholder="Entrez votre mot de passe"
            value={password}
            onChange={(e) => setPasswordState(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
            minLength={8}
          />
          <p className="text-xs text-gray-500 mt-1">Le mot de passe doit contenir au moins 8 caractères</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
          <input
            type="password"
            placeholder="Confirmez votre mot de passe"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
            minLength={8}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Création en cours...' : (isNewUser ? 'Finaliser l\'inscription' : 'Créer le mot de passe')}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => navigate('/dashbord')}
          className="text-purple-600 hover:text-purple-800 underline"
        >
          Plus tard, retourner au dashboard
        </button>
      </div>
    </div>
  );
}
