const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`)
  : 'http://localhost:8080/api';


const getAuthToken = () => {
  return localStorage.getItem('token');
};


const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };


  if (config.body instanceof FormData) {
    if (config.headers && config.headers['Content-Type']) {
      delete config.headers['Content-Type'];
    }
  }

  try {
    console.log(`Making API request to: ${API_BASE_URL}${endpoint}`);
    console.log('Request config:', config);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server.' );
    }
    
    throw error;
  }
};


export const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  loginWithFirebase: (firebaseData) => apiRequest('/auth/firebase', {
    method: 'POST',
    body: JSON.stringify(firebaseData),
  }),
  
  
  getMe: () => apiRequest('/auth/me'),
};


export const journalAPI = {
  getEntries: () => apiRequest('/journal'),
  
  createEntry: (entryData) => {
    console.log('journalAPI.createEntry called with:', entryData)
    return apiRequest('/journal', {
      method: 'POST',
      body: JSON.stringify(entryData),
    })
  },
  
  updateEntry: (id, entryData) => {
    console.log('journalAPI.updateEntry called with:', { id, entryData })
    return apiRequest(`/journal/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entryData),
    })
  },
  
  deleteEntry: (id) => apiRequest(`/journal/${id}`, {
    method: 'DELETE',
  }),
  
  analyzeEntry: (content) => apiRequest('/journal/analyze', {
    method: 'POST',
    body: JSON.stringify({ content }),
  }),
};

// Habit API
export const habitAPI = {
  getHabits: () => apiRequest('/habits'),
  
  createHabit: (habitData) => apiRequest('/habits', {
    method: 'POST',
    body: JSON.stringify(habitData),
  }),
  
  updateHabit: (id, habitData) => apiRequest(`/habits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(habitData),
  }),
  
  deleteHabit: (id) => apiRequest(`/habits/${id}`, {
    method: 'DELETE',
  }),
  
  toggleCompletion: (id, date) => apiRequest(`/habits/${id}/toggle`, {
    method: 'PATCH',
    body: JSON.stringify({ date }),
  }),
  
  getStats: (month, year) => apiRequest(`/habits/stats?month=${month}&year=${year}`),
};

// Gratitude API
export const gratitudeAPI = {
  getEntries: () => {
    console.log('gratitudeAPI.getEntries called')
    return apiRequest('/gratitude')
  },
  
  createEntry: (entryData) => {
    console.log('gratitudeAPI.createEntry called with:', entryData)
    return apiRequest('/gratitude', {
      method: 'POST',
      body: JSON.stringify(entryData),
    })
  },
  
  updateEntry: (id, entryData) => {
    console.log('gratitudeAPI.updateEntry called with:', { id, entryData })
    return apiRequest(`/gratitude/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entryData),
    })
  },
  
  deleteEntry: (id) => {
    console.log('gratitudeAPI.deleteEntry called with:', id)
    return apiRequest(`/gratitude/${id}`, {
      method: 'DELETE',
    })
  },
  
  getStats: (month, year) => {
    console.log('gratitudeAPI.getStats called with:', { month, year })
    return apiRequest(`/gratitude/stats?month=${month}&year=${year}`)
  },
};

// Album API
export const albumAPI = {
  getUserAlbums: () => apiRequest('/albums'),
  
  createAlbum: (albumData) => apiRequest('/albums', {
    method: 'POST',
    body: JSON.stringify(albumData),
  }),
  
  getAlbumById: (id) => apiRequest(`/albums/${id}`),
  
  updateAlbum: (id, albumData) => apiRequest(`/albums/${id}`, {
    method: 'PUT',
    body: JSON.stringify(albumData),
  }),
  
  deleteAlbum: (id) => apiRequest(`/albums/${id}`, {
    method: 'DELETE',
  }),
  
  getAlbumStats: () => apiRequest('/albums/stats'),
};


export const photoAPI = {
  uploadPhoto: (albumId, formData) => {
    return apiRequest(`/photos/album/${albumId}/single`, {
      method: 'POST',
      headers: {}, 
      body: formData,
    });
  },
  
  uploadMultiplePhotos: (albumId, formData) => {
    return apiRequest(`/photos/album/${albumId}/multiple`, {
      method: 'POST',
      headers: {}, 
      body: formData,
    });
  },
  
  getPhotosByAlbum: (albumId) => apiRequest(`/photos/album/${albumId}`),
  
  getAllUserPhotos: () => apiRequest('/photos/user/all'),
  
  updatePhotoNote: (id, noteData) => apiRequest(`/photos/${id}/note`, {
    method: 'PATCH',
    body: JSON.stringify(noteData),
  }),
  
  deletePhoto: (id) => apiRequest(`/photos/${id}`, {
    method: 'DELETE',
  }),
};
export const chatAPI = {

  sendMessage: async (message) => {
    return apiRequest('/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  },


  getHistory: async () => {
    return apiRequest('/chat', {
      method: 'GET'
    });
  }
};


export const playlistAPI = {
  getUserPlaylists: () => apiRequest('/playlists'),
  
  createPlaylist: (playlistData) => apiRequest('/playlists', {
    method: 'POST',
    body: JSON.stringify(playlistData),
  }),
  
  getPlaylistById: (id) => apiRequest(`/playlists/${id}`),
  
  updatePlaylist: (id, playlistData) => apiRequest(`/playlists/${id}`, {
    method: 'PUT',
    body: JSON.stringify(playlistData),
  }),
  
  deletePlaylist: (id) => apiRequest(`/playlists/${id}`, {
    method: 'DELETE',
  }),
  
  addTrackToPlaylist: (playlistId, trackData) => apiRequest(`/playlists/${playlistId}/tracks`, {
    method: 'POST',
    body: JSON.stringify(trackData),
  }),
  
  removeTrackFromPlaylist: (playlistId, trackId) => apiRequest(`/playlists/${playlistId}/tracks/${trackId}`, {
    method: 'DELETE',
  }),
  
  getPlaylistStats: () => apiRequest('/playlists/stats'),
};


export const healthCheck = () => apiRequest('/health');

export default {
  auth: authAPI,
  journal: journalAPI,
  habits: habitAPI,
  gratitude: gratitudeAPI,
  albums: albumAPI,
  photos: photoAPI,
  chat: chatAPI,
  playlists: playlistAPI,
  health: healthCheck,
};