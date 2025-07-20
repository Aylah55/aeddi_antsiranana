import React from 'react';
import { useLocation } from 'react-router-dom';

const TestRoute = () => {
  const location = useLocation();
  
  console.log('=== TestRoute Component ===');
  console.log('Location:', location);
  console.log('Pathname:', location.pathname);
  console.log('Search:', location.search);
  console.log('Hash:', location.hash);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">✅ Route Testée avec Succès !</h1>
        <div className="text-left space-y-2">
          <p><strong>Pathname:</strong> {location.pathname}</p>
          <p><strong>Search:</strong> {location.search}</p>
          <p><strong>Hash:</strong> {location.hash}</p>
          <p><strong>URL complète:</strong> {window.location.href}</p>
        </div>
        <div className="mt-6 p-4 bg-green-50 rounded">
          <p className="text-green-800">
            Si vous voyez cette page, le routage React fonctionne correctement !
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestRoute; 