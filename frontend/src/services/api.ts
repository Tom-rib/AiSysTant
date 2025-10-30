import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API Endpoints helpers
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
  
  me: () => api.get('/auth/me'),
  
  logout: () => api.post('/auth/logout'),
}

export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  
  getConversation: (conversationId: number) =>
    api.get(`/chat/conversations/${conversationId}`),
  
  getMessages: (conversationId: string) =>
    api.get(`/chat/conversations/${conversationId}/messages`),
  
  sendMessage: (conversationId: number, content: string) =>
    api.post(`/chat/conversations/${conversationId}/messages`, { content }),
  
  createConversation: (title: string) =>
    api.post('/chat/conversations', { title }),
  
  deleteConversation: (conversationId: number) =>
    api.delete(`/chat/conversations/${conversationId}`),
}

export const sshAPI = {
  getServers: () => api.get('/ssh/servers'),
  
  addServer: (server: {
    name: string
    host: string
    port: number
    username: string
    password?: string
    privateKey?: string
  }) => api.post('/ssh/servers', server),
  
  deleteServer: (serverId: string) =>
    api.delete(`/ssh/servers/${serverId}`),
  
  connect: (serverId: string) =>
    api.post(`/ssh/servers/${serverId}/connect`),
  
  executeCommand: (serverId: string, command: string) =>
    api.post(`/ssh/servers/${serverId}/execute`, { command }),
}

export const statsAPI = {
  getDashboard: () => api.get('/stats'),
  
  getActivityLog: (limit: number = 50) =>
    api.get(`/stats/activity?limit=${limit}`),
}

export default api