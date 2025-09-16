// Square OAuth Integration Service
// This service handles the OAuth flow and direct API calls to Square (TEST ONLY)

const SQUARE_CONFIG = {
  // ⚠️ EMBEDDED TEST CREDENTIALS – DO NOT USE IN PRODUCTION
  clientId: 'sandbox-sq0idb-chjvhl0FN0PXjYJmeEjOkA', // Sandbox Application ID
  clientSecret: 'sandbox-sq0csb-3XQuCgmcCaVi4Es0IGWm0smxcbptp1VkYHqyPivMl5o', // Sandbox Application Secret
  redirectUri: 'https://www.google.ie',
  apiBaseUrl: 'https://connect.squareup.com',
  oauthUrl: 'https://connect.squareup.com/oauth2/authorize',
  tokenUrl: 'https://connect.squareup.com/oauth2/token'
};

class SquareService {
  // Generate OAuth URL for Square authentication
  static generateOAuthUrl() {
    const state = 'square_oauth_' + Date.now();
    const scope = 'MERCHANT_PROFILE_READ PAYMENTS_READ ORDERS_READ CUSTOMERS_READ';

    const params = new URLSearchParams({
      client_id: SQUARE_CONFIG.clientId,
      redirect_uri: SQUARE_CONFIG.redirectUri,
      response_type: 'code',
      scope: scope,
      state: state
    });

    localStorage.setItem('square_oauth_state', state);
    localStorage.setItem('square_redirect_path', window.location.pathname);

    return `${SQUARE_CONFIG.oauthUrl}?${params.toString()}`;
  }

  // Exchange authorization code for access token – direct call to Square API (TEST ONLY)
  static async exchangeCodeForToken(code) {
    try {
      const bodyParams = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: SQUARE_CONFIG.clientId,
        client_secret: SQUARE_CONFIG.clientSecret,
        code: code,
        redirect_uri: SQUARE_CONFIG.redirectUri
      });

      const response = await fetch(SQUARE_CONFIG.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Square-Version': '2024-01-17'
        },
        body: bodyParams.toString()
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error_description || 'Token exchange failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }

  // Fetch merchant profile directly from Square
  static async fetchMerchantProfile(accessToken) {
    try {
      const response = await fetch(`${SQUARE_CONFIG.apiBaseUrl}/v2/merchants/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Square-Version': '2024-01-17'
        }
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch merchant profile');
      }

      const data = await response.json();
      return data.merchant;
    } catch (error) {
      console.error('Merchant profile fetch error:', error);
      throw error;
    }
  }

  // Store merchant data and tokens securely
  static storeMerchantData(merchant, accessToken, refreshToken) {
    const data = {
      merchant,
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      },
      connected_at: new Date().toISOString(),
      provider: 'square'
    };

    localStorage.setItem('square_merchant_data', JSON.stringify(data));
    console.log('✅ Square merchant data stored securely');
  }

  // Get stored merchant data
  static getMerchantData() {
    try {
      const data = localStorage.getItem('square_merchant_data');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting Square merchant data:', error);
      return null;
    }
  }

  // Check if Square is connected
  static isConnected() {
    const data = this.getMerchantData();
    if (!data) return false;
    
    // Check if token is expired
    if (data.tokens.expires_at && Date.now() > data.tokens.expires_at) {
      this.disconnect();
      return false;
    }
    
    return true;
  }

  // Disconnect Square
  static disconnect() {
    localStorage.removeItem('square_merchant_data');
    localStorage.removeItem('square_oauth_state');
    localStorage.removeItem('square_redirect_path');
    console.log('✅ Square disconnected');
  }

  // Get redirect path
  static getRedirectPath() {
    return localStorage.getItem('square_redirect_path') || '/';
  }

  // Refresh access token directly (TEST ONLY)
  static async refreshAccessToken() {
    try {
      const data = this.getMerchantData();
      if (!data || !data.tokens.refresh_token) throw new Error('No refresh token stored');

      const bodyParams = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: SQUARE_CONFIG.clientId,
        client_secret: SQUARE_CONFIG.clientSecret,
        refresh_token: data.tokens.refresh_token
      });

      const response = await fetch(SQUARE_CONFIG.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Square-Version': '2024-01-17'
        },
        body: bodyParams.toString()
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error_description || 'Token refresh failed');
      }

      const tokenData = await response.json();
      this.storeMerchantData(data.merchant, tokenData.access_token, tokenData.refresh_token);
      return tokenData;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.disconnect();
      throw error;
    }
  }

  // Validate OAuth state
  static validateOAuthState(state) {
    return localStorage.getItem('square_oauth_state') === state;
  }

  // Fetch locations from Square
  static async fetchLocations(accessToken) {
    try {
      const response = await fetch(`${SQUARE_CONFIG.apiBaseUrl}/v2/locations`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Square-Version': '2024-01-17'
        }
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch locations');
      }

      const data = await response.json();
      return data.locations;
    } catch (error) {
      console.error('Locations fetch error:', error);
      throw error;
    }
  }

  // Fetch recent transactions from Square
  static async fetchTransactions(accessToken, locationId, limit = 50) {
    try {
      const response = await fetch(`${SQUARE_CONFIG.apiBaseUrl}/v2/payments?location_id=${locationId}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Square-Version': '2024-01-17'
        }
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch transactions');
      }

      const data = await response.json();
      return data.payments;
    } catch (error) {
      console.error('Transactions fetch error:', error);
      throw error;
    }
  }
}

export default SquareService; 