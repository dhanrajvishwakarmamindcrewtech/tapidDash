// SumUp OAuth Integration Service
// This service handles the OAuth flow and direct API calls to SumUp (TEST ONLY)

const SUMUP_CONFIG = {
  // ⚠️ EMBEDDED TEST CREDENTIALS – DO NOT USE IN PRODUCTION
  clientId: 'cc_classic_Zrx7ckHBbJRI4PaKxSUlIep2tQjGe', // replace with your real test client-id
  clientSecret: 'cc_sk_classic_kqeonOdFG8Mzn5ZzxQF7ttt9sZhAPfh9w1o12rDBfjG9iHRppC',
  redirectUri: 'https://www.google.ie',
  apiBaseUrl: 'https://api.sumup.com',
  oauthUrl: 'https://api.sumup.com/authorize',
  tokenUrl: 'https://api.sumup.com/token'
};



class SumUpService {
  // Generate OAuth URL for SumUp authentication
  static generateOAuthUrl() {
    const state = 'sumup_oauth_' + Date.now();
    const scope = 'transactions.history user.app-settings user.profile_readonly';

    const params = new URLSearchParams({
      client_id: SUMUP_CONFIG.clientId,
      redirect_uri: SUMUP_CONFIG.redirectUri,
      response_type: 'code',
      scope: scope,
      state: state
    });

    localStorage.setItem('sumup_oauth_state', state);
    localStorage.setItem('sumup_redirect_path', window.location.pathname);

    return `${SUMUP_CONFIG.oauthUrl}?${params.toString()}`;
  }

  // Exchange authorization code for access token – direct call to SumUp API (TEST ONLY)
  static async exchangeCodeForToken(code) {
    try {
      const bodyParams = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: SUMUP_CONFIG.clientId,
        client_secret: SUMUP_CONFIG.clientSecret,
        code: code,
        redirect_uri: SUMUP_CONFIG.redirectUri
      });

      const response = await fetch(SUMUP_CONFIG.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
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

  // Fetch merchant profile directly from SumUp
  static async fetchMerchantProfile(accessToken) {
    try {
      const response = await fetch(`${SUMUP_CONFIG.apiBaseUrl}/v0.1/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch merchant profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Merchant profile fetch error:', error);
      throw error;
    }
  }

  // Store merchant data | unchanged
  static storeMerchantData(merchantData, accessToken, refreshToken) {
    const secureData = {
      merchant: merchantData,
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: Date.now() + 3600 * 1000
      },
      connected_at: new Date().toISOString()
    };
    localStorage.setItem('sumup_merchant_data', JSON.stringify(secureData));
  }

  static getMerchantData() {
    const data = localStorage.getItem('sumup_merchant_data');
    return data ? JSON.parse(data) : null;
  }

  static isConnected() {
    const data = this.getMerchantData();
    return !!(data && data.tokens && data.tokens.access_token);
  }

  // Refresh access token directly (TEST ONLY)
  static async refreshAccessToken() {
    try {
      const data = this.getMerchantData();
      if (!data || !data.tokens.refresh_token) throw new Error('No refresh token stored');

      const bodyParams = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: SUMUP_CONFIG.clientId,
        client_secret: SUMUP_CONFIG.clientSecret,
        refresh_token: data.tokens.refresh_token
      });

      const response = await fetch(SUMUP_CONFIG.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
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

  static disconnect() {
    localStorage.removeItem('sumup_merchant_data');
    localStorage.removeItem('sumup_oauth_state');
  }

  static validateOAuthState(state) {
    return localStorage.getItem('sumup_oauth_state') === state;
  }

  static getRedirectPath() {
    return localStorage.getItem('sumup_redirect_path') || '/';
  }
}

export default SumUpService; 