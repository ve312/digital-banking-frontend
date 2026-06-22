import api from './api';

export const getAllCuentas = () => api.get('/cuentas');
export const getCuentasByCliente = (clienteId) => api.get(`/cuentas/cliente/${clienteId}`);
export const createCuenta = (data) => api.post('/cuentas', data);
export const activarCuenta = (numeroCuenta) => api.patch(`/cuentas/${numeroCuenta}/activar`);
export const inactivarCuenta = (numeroCuenta) => api.patch(`/cuentas/${numeroCuenta}/inactivar`);
export const cancelarCuenta = (numeroCuenta) => api.patch(`/cuentas/${numeroCuenta}/cancelar`);
export const getCuenta = (numeroCuenta) => api.get(`/cuentas/${numeroCuenta}`);
