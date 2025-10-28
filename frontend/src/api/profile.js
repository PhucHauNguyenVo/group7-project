import axios from "axios";

// profile.js
const API_URL = process.env.REACT_APP_API_URL; // ví dụ https://microelectronic-corrin-strung.ngrok-free.dev/api

export const getProfile = async (token) => {
  if (!token) throw new Error("No token provided");

  return (await axios.get(`${API_URL}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  })).data;
};

export const updateProfile = async (token, updatedData) => {
  if (!token) throw new Error("No token provided");

  return (await axios.put(`${API_URL}/users/profile`, updatedData, {
    headers: { 
      Authorization: `Bearer ${token}`
    },
  })).data;
};
