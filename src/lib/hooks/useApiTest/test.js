// class ApiClient {
//     constructor() {
//         this.accessToken = null;
//         this.refreshToken = null;
//         this.tokenExpiry = null;
//     }

//     async login(email, password) {
//         const response = await fetch('/api/login', {
//             method: 'POST',
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify({email, password})
//         });

//         const data = await response.json();

//         // Store tokens securely
//         this.accessToken = data.data.access_token;
//         this.refreshToken = data.data.refresh_token;
//         this.tokenExpiry = Date.now() + (data.data.expires_in * 1000);

//         // Save to secure storage
//         await SecureStorage.setItem('access_token', this.accessToken);
//         await SecureStorage.setItem('refresh_token', this.refreshToken);

//         return data;
//     }

//     async apiCall(endpoint, options = {}) {
//         // Check if token needs refresh (refresh 5 min before expiry)
//         if (Date.now() > this.tokenExpiry - 300000) {
//             await this.refreshAccessToken();
//         }

//         // Make API call with access token
//         const response = await fetch(endpoint, {
//             ...options,
//             headers: {
//                 ...options.headers,
//                 'Authorization': Bearer ${this.accessToken}
//             }
//         });

//         // If 401, try refreshing once
//         if (response.status === 401) {
//             await this.refreshAccessToken();

//             // Retry original request
//             return fetch(endpoint, {
//                 ...options,
//                 headers: {
//                     ...options.headers,
//                     'Authorization': Bearer ${this.accessToken}
//                 }
//             });
//         }

//         return response;
//     }

//     async refreshAccessToken() {
//         const response = await fetch('/api/refresh', {
//             method: 'POST',
//             headers: {
//                 'Authorization': Bearer ${this.refreshToken}
//             }
//         });

//         if (!response.ok) {
//             // Refresh token invalid/expired - force re-login
//             await this.logout();
//             throw new Error('Session expired. Please login again.');
//         }

//         const data = await response.json();

//         // Update tokens
//         this.accessToken = data.data.access_token;
//         this.refreshToken = data.data.refresh_token;
//         this.tokenExpiry = Date.now() + (data.data.expires_in * 1000);

//         // Save to secure storage
//         await SecureStorage.setItem('access_token', this.accessToken);
//         await SecureStorage.setItem('refresh_token', this.refreshToken);
//     }

//     async logout() {
//         await fetch('/api/logout', {
//             method: 'POST',
//             headers: {
//                 'Authorization': Bearer ${this.accessToken}
//             }
//         });

//         this.accessToken = null;
//         this.refreshToken = null;
//         this.tokenExpiry = null;

//         await SecureStorage.removeItem('access_token');
//         await SecureStorage.removeItem('refresh_token');
//     }
// }

// // Usage
// const api = new ApiClient();

// // Login
// await api.login('user@example.com', 'password');

// // Make API calls (automatic refresh handling)
// const users = await api.apiCall('/api/users');
// const invoices = await api.apiCall('/api/invoices');