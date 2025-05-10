import { useEffect } from 'react';
import axios from 'axios';

function Accueil() {
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/test`)
      .then(res => console.log('Réponse du backend :', res.data))
      .catch(err => console.error('Erreur de connexion :', err));
  }, []);

  return (
    <div>
      <h1>Bienvenue sur la page d'accueil</h1>
      <p>Regarde la console pour tester la connexion au backend</p>
    </div>
  );
}

export default Accueil;
