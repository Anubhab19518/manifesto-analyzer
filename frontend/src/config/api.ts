// API Configuration
const API_CONFIG = {
  // Toggle this for local development vs production
  USE_LOCAL: false, // Set to false for production
  
  LOCAL_BASE_URL: 'http://localhost:8000',
  PRODUCTION_BASE_URL: 'https://manifesto-analyzer-backend.onrender.com',
  
  get BASE_URL() {
    return this.USE_LOCAL ? this.LOCAL_BASE_URL : this.PRODUCTION_BASE_URL;
  },
  
  get MODE() {
    return this.USE_LOCAL ? 'Local Development' : 'Production';
  },
  
  get ENDPOINTS() {
    return {
      ANALYZE: `${this.BASE_URL}/analyze/`,
      COMPARE: `${this.BASE_URL}/compare/`,
      TRANSLATE: `${this.BASE_URL}/translate/`,
      HEALTH: `${this.BASE_URL}/health`,
    };
  }
};

// Log the current configuration
console.log(`🚀 API Mode: ${API_CONFIG.MODE}`);
console.log(`🔗 Base URL: ${API_CONFIG.BASE_URL}`);

export default API_CONFIG;
