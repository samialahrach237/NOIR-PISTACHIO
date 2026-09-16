import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('noir_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function getProducts() { return (await api.get('/products')).data.data; }
export async function getCategories() { return (await api.get('/categories')).data.data; }
export async function getFeaturedProduct() { return (await api.get('/products/featured')).data.data; }
export async function getGallery() { return (await api.get('/gallery')).data.data; }
export async function getReviews() { return (await api.get('/reviews')).data.data; }
export async function register(payload) { return (await api.post('/register', payload)).data.data; }
export async function login(payload) { const result = (await api.post('/login', payload)).data.data; localStorage.setItem('noir_token', result.token); return result; }
export async function logout() { await api.post('/logout'); localStorage.removeItem('noir_token'); }
export async function getUser() { return (await api.get('/user')).data.data; }
export async function createOrder(payload) { return (await api.post('/orders', payload)).data.data; }
export async function getOrders() { return (await api.get('/orders')).data.data; }
export async function cancelOrder(id) { return (await api.patch(`/orders/${id}/cancel`)).data.data; }
export async function createReservation(payload) { return (await api.post('/reservations', payload)).data.data; }
export async function getReservations() { return (await api.get('/reservations')).data.data; }
export async function cancelReservation(id) { return (await api.patch(`/reservations/${id}/cancel`)).data.data; }
export async function createReview(payload) { return (await api.post('/reviews', payload)).data.data; }
export async function sendContactMessage(payload) { return (await api.post('/contact', payload)).data.data; }
export async function getAdminStats() { return (await api.get('/admin/stats')).data.data; }
export async function getAdminProducts() { return (await api.get('/admin/products')).data.data; }
export async function createProduct(payload) { return (await api.post('/admin/products', payload)).data.data; }
export async function updateProduct(id, payload) { return (await api.put(`/admin/products/${id}`, payload)).data.data; }
export async function deleteProduct(id) { return (await api.delete(`/admin/products/${id}`)).data.data; }
export async function updateOrderStatus(id, status) { return (await api.patch(`/admin/orders/${id}`, { status })).data.data; }

export default api;
