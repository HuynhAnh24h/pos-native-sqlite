// src/state/SessionStore.js
import { AuthService } from '../services/AuthService';

let session = { token: null, user: null };

export const SessionStore = {
  async init() {
    try {
      const token = await AuthService.getSessionToken();
      if (token) {
        session.token = token;
      }
    } catch (error) {
      console.error('Failed to init session:', error);
    }
  },
  
  setSession({ token, user, userId }) {
    session = { 
      token, 
      user,
      userId: userId || user?.id
    };
    
    // Lưu vào storage
    if (token) {
      AuthService.saveSessionToken(token);
    }
  },
  
  clear() {
    session = { token: null, user: null, userId: null };
    AuthService.logout();
  },
  
  get() {
    return session;
  }
};