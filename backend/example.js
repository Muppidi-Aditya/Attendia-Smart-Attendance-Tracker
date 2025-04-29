const axios = require('axios');

// Base URL
const baseUrl = 'https://campusapi.fly.dev';

// Login endpoint
const loginUrl = `${baseUrl}/api/auth/login/`;
// User info endpoint
const userUrl = `${baseUrl}/api/auth/user/`;

// Payload for login
const loginData = {
  username: 'aa7923@srmist.edu.in',
  password: 'Adi@2004'
};

// Headers for both requests
const commonHeaders = {
  'Content-Type': 'application/json',
  'Accept': '*/*',
  'Origin': 'https://campusweb.vercel.app',
  'Referer': 'https://campusweb.vercel.app/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
};

// Function to perform login
async function performLogin() {
  try {
    const loginResponse = await axios.post(loginUrl, loginData, {
      headers: commonHeaders
    });

    console.log(loginResponse.data.Response);

    // Extract cookies from the response body (Cookies field)
    const cookies = loginResponse.data.Cookies;
    console.log(cookies)
    if (!cookies) {
      throw new Error('No cookies found in login response');
    }

    // Call the getUserInfo function with the cookies
    await getUserInfo(cookies);
  } catch (error) {
    if (error.response) {
      console.error('Login error response:', error.response.data);
      console.error('Status code:', error.response.status);
    } else if (error.request) {
      console.error('No response received for login:', error.request);
    } else {
      console.error('Login error:', error.message);
    }
  }
}

// Function to get user info using cookies from login
async function getUserInfo(cookies) {
  try {
    const userResponse = await axios.get(userUrl, {
      headers: {
        ...commonHeaders, // Spread common headers
        'Cookie': cookies, // Pass cookies from login response
        'x-csrf-token': cookies // Include if required (adjust as needed)
      }
    });

    console.log('User info retrieved! Response:', userResponse.data);
  } catch (error) {
    if (error.response) {
      console.error('User info error response:', error.response.data);
      console.error('Status code:', error.response.status);
    } else if (error.request) {
      console.error('No response received for user info:', error.request);
    } else {
      console.error('User info error:', error.message);
    }
  }
}

// Execute the login function
performLogin();