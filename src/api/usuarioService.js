import api from './api';

export const getUsuarios = () => api.get('/usuarios');
export const createUsuario = (data) => api.post('/usuarios', data);
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data);
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`);
export const changePassword = (id, data) => api.patch(`/usuarios/${id}/password`, data);
