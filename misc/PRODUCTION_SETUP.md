# Production Setup: SumUp OAuth Integration

This guide explains how to set up the SumUp OAuth integration for production use.

## 🎯 Overview

For production, you need to implement proper OAuth authentication with SumUp to securely get merchant details. The current implementation includes:

1. **OAuth Flow**: Redirect users to SumUp's OAuth endpoint
2. **Callback Handling**: Handle the OAuth callback with authorization code
3. **Token Exchange**: Exchange the code for access tokens (backend)
4. **Merchant Data**: Use the access token to fetch merchant details

## 🔧 Setup Steps

### 1. SumUp Developer Account

1. Go to [SumUp Developer Dashboard](https://developer.sumup.com)
2. Create a new application
3. Get your `CLIENT_ID` and `CLIENT_SECRET`
4. Set your redirect URI to: `https://yourdomain.com/auth/sumup/callback`

### 2. Environment Variables

Create a `.env` file in your backend directory:

```bash
# Backend .env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# SumUp OAuth Credentials
SUMUP_CLIENT_ID=your_actual_client_id
SUMUP_CLIENT_SECRET=your_actual_client_secret

# Security
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
```

### 3. Frontend Environment Variables

Create a `.env` file in your React app root:

```bash
# Frontend .env
REACT_APP_SUMUP_CLIENT_ID=your_actual_client_id
REACT_APP_API_BASE_URL=https://yourbackend.com/api
```

### 4. Backend Server Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Start the server:
```bash
npm start
```

### 5. OAuth Flow Implementation

The OAuth flow works as follows:

1. **User clicks "Connect SumUp"**
   - Frontend generates OAuth URL
   - User is redirected to SumUp login

2. **User authenticates with SumUp**
   - SumUp redirects back with authorization code
   - Frontend handles callback

3. **Token Exchange (Backend)**
   - Backend exchanges code for access token
   - Stores tokens securely

4. **Merchant Data Fetch**
   - Use access token to fetch merchant profile
   - Store merchant data in your system

## 🔐 Security Considerations

### Backend Security
- **Never expose client secret** in frontend code
- Use HTTPS in production
- Implement proper session management
- Store tokens securely (encrypted database)
- Implement token refresh logic

### Frontend Security
- Store tokens in secure HTTP-only cookies
- Implement proper CSRF protection
- Validate OAuth state parameter
- Handle token expiration gracefully

## 📋 Production Checklist

- [ ] SumUp developer account created
- [ ] OAuth credentials obtained
- [ ] Backend server deployed
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] Error handling implemented
- [ ] Token refresh logic added
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Logging and monitoring added

## 🚀 Deployment

### Backend Deployment
```bash
# Deploy to your preferred platform (Heroku, AWS, etc.)
git push heroku main
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to your hosting platform
```

## 🔍 Testing

### Test OAuth Flow
1. Start both frontend and backend servers
2. Navigate to your app
3. Click "Connect POS System"
4. Select SumUp and click "Unconnected"
5. Complete OAuth flow
6. Verify merchant data is fetched

### Test Error Handling
- Test with invalid credentials
- Test with expired tokens
- Test network failures
- Test callback errors

## 📚 API Documentation

### SumUp API Endpoints Used
- `GET /v0.1/me` - Get merchant profile
- `GET /v0.1/me/transactions` - Get transaction history
- `POST /token` - Exchange authorization code

### Backend API Endpoints
- `POST /api/sumup/token` - Exchange code for tokens
- `POST /api/sumup/refresh` - Refresh access token
- `GET /api/sumup/merchant` - Get merchant profile
- `GET /api/sumup/transactions` - Get transactions

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured correctly
   - Check frontend URL in CORS settings

2. **Token Exchange Fails**
   - Verify client credentials
   - Check redirect URI matches exactly
   - Ensure authorization code is valid

3. **Merchant Data Not Loading**
   - Check access token is valid
   - Verify API permissions
   - Check network connectivity

### Debug Mode

Enable debug logging in backend:
```javascript
// Add to backend server
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

## 📞 Support

For SumUp API support:
- [SumUp Developer Documentation](https://developer.sumup.com/docs)
- [SumUp API Reference](https://developer.sumup.com/api)

For implementation questions:
- Check the code comments
- Review the OAuth flow logs
- Test with SumUp sandbox environment first

## 🔄 Updates

This implementation will be updated as SumUp's API evolves. Check the SumUp developer documentation for the latest changes. 