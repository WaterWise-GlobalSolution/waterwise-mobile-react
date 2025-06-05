// src/services/apiService.ts
export const API_BASE_URL = 'http://localhost:5072/api/v1';

export const createApiInstance = () => {
  const axios = require('axios');
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};