import React, { useState,useRef } from 'react';
import { FiEdit, FiTrash2, FiX, FiSave, FiUser,FiCamera } from 'react-icons/fi';
import { userService } from '../../services/api';

const API_URL = 'http://localhost:8000';
export const UserActions = ({ user, onEdit, onDelete }) => {
  return (
    <div className="flex space-x-2 justify-end">
      <button
        onClick={() => onEdit(user)}
        className="text-blue-600 hover:text-blue-800 p-1.5 rounded-full hover:bg-blue-50 transition-colors"
        title="Modifier"
      >
        <FiEdit className="h-4 w-4" />
      </button>
      <button
        onClick={() => onDelete(user)}
        className="text-red-600 hover:text-red-800 p-1.5 rounded-full hover:bg-red-50 transition-colors"
        title="Supprimer"
      >
        <FiTrash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export const EditUserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...user });
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérification du type et taille du fichier
      if (!file.type.match('image.*')) {
        setErrors(prev => ({ ...prev, photo: ['Seules les images sont autorisées'] }));
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) { // 2MB max
        setErrors(prev => ({ ...prev, photo: ['La taille maximale est de 2MB'] }));
        return;
      }

      // Prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Mise à jour des données
      setFormData(prev => ({ ...prev, photoFile: file }));
      setErrors(prev => ({ ...prev, photo: null }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formDataToSend = new FormData();
    formDataToSend.append('_method', 'PUT'); // Important pour Laravel
    formDataToSend.append('nom', formData.nom || '');
    formDataToSend.append('prenom', formData.prenom || '');
    formDataToSend.append('email', formData.email || '');
    
    if (formData.photoFile) {
        formDataToSend.append('photo', formData.photoFile);
    }

    try {
        const response = await userService.update(user.id, formDataToSend);
        
        if (response.data.success && response.data.user) {
            onSave(response.data.user);
        } else {
            throw new Error(response.data.message || "Réponse API invalide");
        }
    } catch (error) {
        console.error("Erreur API:", error.response?.data || error);
        
        if (error.response?.data?.errors) {
            setErrors(error.response.data.errors);
        } else {
            setErrors({ general: error.message });
        }
    } finally {
        setIsSubmitting(false);
    }
};


  // URL de l'image actuelle ou de prévisualisation
  const imageUrl = previewImage || (formData.photo ? `${API_URL}/storage/${formData.photo}` : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold text-gray-800">Modifier l'utilisateur</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Section Photo */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-gray-200">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt="Profil" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                    <FiUser className="text-gray-400 h-16 w-16" />
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={triggerFileInput}
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-transform transform group-hover:scale-110"
              >
                <FiCamera className="h-4 w-4" />
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            
            {errors.photo && (
              <p className="mt-2 text-sm text-red-600">{errors.photo[0]}</p>
            )}
          </div>

          {/* Champs du formulaire */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  errors.nom ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                required
              />
              {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom[0]}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  errors.prenom ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                required
              />
              {errors.prenom && <p className="mt-1 text-sm text-red-600">{errors.prenom[0]}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  errors.email ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                required
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>}
            </div>
          </div>
          
          {/* Erreur générale */}
          {errors.general && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md">
              {errors.general}
            </div>
          )}
          
          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enregistrement...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const DeleteConfirmationModal = ({ user, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold text-gray-800">Confirmer suppression</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <FiUser className="text-red-600 h-8 w-8" />
            </div>
          </div>
          <p className="text-gray-700 text-center mb-6">
            Voulez-vous vraiment supprimer <span className="font-semibold">{user.prenom} {user.nom}</span> ?
            <br />
            Cette action est irréversible.
          </p>
          
          <div className="flex justify-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={() => onConfirm(user.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
            >
              <FiTrash2 className="mr-2" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};