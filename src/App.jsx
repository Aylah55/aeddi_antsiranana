import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('Connexion en cours...');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/ping`)
      .then(res => {
        setMessage(res.data.message);
      })
      .catch(() => {
        setMessage('Erreur de connexion au backend');
      });
  }, []);

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>{message}</h1>
    </div>
  );
}

export default App;
