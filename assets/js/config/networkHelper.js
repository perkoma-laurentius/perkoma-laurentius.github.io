// assets/js/networkHelper.js
import { BASE_URL } from './baseUrl.js';

export class NetworkHelper {
    /**
     * General HTTP request method
     * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
     * @param {string} endpoint - API endpoint (relative path, e.g., "/api/auth/send-verification-email")
     * @param {object} body - Request payload (default: null)
     * @param {object} headers - Custom headers (default: {})
     * @returns {Promise<object>} - Response JSON
     */
    static async request(method, endpoint, body = null, headers = {}) {
        const url = `${BASE_URL}${endpoint}`; // Combine base URL and endpoint
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`, // Add token to headers
                ...headers
            },
            body: body ? JSON.stringify(body) : null
        };

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Parse and return JSON response
        } catch (error) {
            // console.error(`Error in request to ${url}:`, error);
            throw error;
        }
    }

    // Shortcut for GET method
    static get(endpoint, headers = {}) {
        return this.request('GET', endpoint, null, headers);
    }

    // Shortcut for POST method
    static post(endpoint, body, headers = {}) {
        return this.request('POST', endpoint, body, headers);
    }

    // Shortcut for PUT method
    static put(endpoint, body, headers = {}) {
        return this.request('PUT', endpoint, body, headers);
    }

    // Shortcut for DELETE method
    static delete(endpoint, headers = {}) {
        return this.request('DELETE', endpoint, null, headers);
    }
}



// documentation use 

// import { NetworkHelper } from './networkHelper.js';

// document.addEventListener('DOMContentLoaded', async () => {
//     try {
//         const response = await NetworkHelper.post('/api/auth/send-verification-email', {
//             email: 'user@example.com'
//         });
//         console.log('Response:', response);
//     } catch (error) {
//         console.error('Error sending verification email:', error);
//     }
// });
