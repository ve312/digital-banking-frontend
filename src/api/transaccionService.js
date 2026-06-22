import api from './api';

export const consignar = (data) => api.post('/transacciones/consignar', data);
export const retirar = (data) => api.post('/transacciones/retirar', data);
export const transferir = (data) => api.post('/transacciones/transferir', data);
export const getTransaccionesByCuenta = (numeroCuenta) => api.get(`/transacciones/cuenta/${numeroCuenta}`);
export const getAllTransacciones = () => api.get('/transacciones');
