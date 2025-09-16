import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import SumUpService from '../services/sumupService';
import styles from './SumUpCallback.module.css';

const SumUpCallback = () => {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing OAuth callback...');
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const error_description = urlParams.get('error_description');

        // Handle OAuth errors
        if (error) {
          console.error('OAuth Error:', error, error_description);
          setStatus('error');
          setMessage(`OAuth Error: ${error_description || error}`);
          return;
        }

        // Validate required parameters
        if (!code || !state) {
          setStatus('error');
          setMessage('Missing authorization code or state parameter');
          return;
        }

        // Validate OAuth state to prevent CSRF
        if (!SumUpService.validateOAuthState(state)) {
          setStatus('error');
          setMessage('Invalid OAuth state parameter');
          return;
        }

        setMessage('Exchanging authorization code for access token...');

        // Exchange code for access token
        const tokenResponse = await SumUpService.exchangeCodeForToken(code);

        if (!tokenResponse.access_token) {
          throw new Error('Failed to get access token');
        }

        setMessage('Fetching merchant profile...');

        // Fetch merchant profile
        const merchantData = await SumUpService.fetchMerchantProfile(tokenResponse.access_token);

        // Store merchant data and tokens securely
        SumUpService.storeMerchantData(
          merchantData,
          tokenResponse.access_token,
          tokenResponse.refresh_token
        );

        setStatus('success');
        setMessage(`Successfully connected to SumUp! Merchant: ${merchantData.company_profile?.merchant_name || merchantData.username || 'Unknown'}`);

        // Get the path to redirect back to
        const redirectPath = SumUpService.getRedirectPath();

        // Redirect back after a short delay
        setTimeout(() => {
          navigate(redirectPath);
        }, 2000);

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(`Connection failed: ${error.message}`);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${styles[status]}`}>
        <div className={styles.iconContainer}>
          {status === 'success' && <CheckCircle size={48} className={styles.successIcon} />}
          {status === 'error' && <XCircle size={48} className={styles.errorIcon} />}
          {status === 'processing' && <Loader size={48} className={styles.loadingIcon} />}
        </div>
        <h2 className={styles.title}>
          {status === 'success' && 'Connection Successful'}
          {status === 'error' && 'Connection Failed'}
          {status === 'processing' && 'Connecting to SumUp'}
        </h2>
        <p className={styles.message}>{message}</p>
        {status === 'error' && (
          <button 
            className={styles.retryButton}
            onClick={() => navigate('/')}
          >
            Return to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default SumUpCallback; 