const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies and enable CORS
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Base URL for external API
const baseUrl = 'https://campusapi.fly.dev';

// Login endpoint
const loginUrl = `${baseUrl}/api/auth/login/`;
// User info endpoint
const userUrl = `${baseUrl}/api/auth/user/`;

// Common headers for external API requests
const commonHeaders = {
  'Content-Type': 'application/json',
  'Accept': '*/*',
  'Origin': 'https://campusweb.vercel.app',
  'Referer': 'https://campusweb.vercel.app/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
};

// POST /api/auth - Handle login and fetch user info in one request
app.post('/api/auth', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Step 1: Perform login
    const loginData = { username, password };
    const loginResponse = await axios.post(loginUrl, loginData, {
      headers: commonHeaders
    });

    const cookies = loginResponse.data.Cookies;
    if (!cookies) {
      return res.status(400).json({ error: 'No cookies found in login response' });
    }

    // Step 2: Fetch user info using cookies
    const userResponse = await axios.get(userUrl, {
      headers: {
        ...commonHeaders,
        'Cookie': cookies,
        'x-csrf-token': cookies // Adjust if the API requires a different CSRF token
      }
    });

    // Step 3: Return combined response
    res.json({
      message: 'Authentication and user info retrieval successful',
      loginResponse: loginResponse.data.Response,
      cookies,
      userInfo: userResponse.data
    });
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        error: 'Operation failed',
        details: error.response.data,
        status: error.response.status
      });
    } else if (error.request) {
      return res.status(500).json({ error: 'No response received from API' });
    } else {
      return res.status(500).json({ error: error.message });
    }
  }
});


app.get('/api/timetable/', async (req, res) => {
  try {

    const { token } = req.query
    
    // API request configuration
    const config = {
      headers: {
        'Content-Type': 'application/json',
        // Add CSRF token for authentication
        'X-CSRF-Token': token
      }
    };
    
    // Make request to the campus API
    const response = await axios.get(`https://campusapi.fly.dev/api/auth/timetable/2`, config);
    
    // Return the data from the API
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching timetable:', error.message);
    
    // Handle different error scenarios
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return res.status(error.response.status).json({
        message: 'Error from campus API',
        error: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(503).json({
        message: 'Unable to reach campus API',
        error: 'Service unavailable'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      return res.status(500).json({
        message: 'Server error',
        error: error.message
      });
    }
  }
});

app.get('/api/planner', async (req, res) => {
  try {
    // API request configuration
    const {token} = req.query
    console.log(token)
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
      },
      withCredentials: true
    };
    
    // Make request to the campus API
    const response = await axios.get('https://campusapi.fly.dev/api/auth/planner', config);
    
    // Return the data from the API
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching planner data:', error.message);
    
    // Handle different error scenarios
    if (error.response) {
      return res.status(error.response.status).json({
        message: 'Error from campus API',
        error: error.response.data
      });
    } else if (error.request) {
      return res.status(503).json({
        message: 'Unable to reach campus API',
        error: 'Service unavailable'
      });
    } else {
      return res.status(500).json({
        message: 'Server error',
        error: error.message
      });
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});