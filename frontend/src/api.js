import axios from 'axios';

// Cette ligne choisit automatiquement l'URL du backend :
// Soit celle de Render (que nous aurons bientôt), soit le local pour tes tests.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

export default api;