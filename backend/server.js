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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'Cache-Control', 'Pragma', 'Expires']
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

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

// POST /api/login - Handle just the login process
app.post('/api/login', async (req, res) => {
  try {
    console.log('Login request received:', JSON.stringify({
      username: req.body.username,
      timestamp: new Date().toISOString()
    }));
    
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Perform login
    const loginData = { username, password };
    console.log('Sending login request to:', loginUrl);
    
    const loginResponse = await axios.post(loginUrl, loginData, {
      headers: commonHeaders
    });

    console.log('Login response status:', loginResponse.status);

    const cookies = loginResponse.data.Cookies;
    if (!cookies) {
      return res.status(400).json({ error: 'No cookies found in login response' });
    }
    
    // Return just the login response
    res.json({
      message: 'Authentication successful',
      loginResponse: loginResponse.data.Response,
      cookies
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Detailed error logging
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', JSON.stringify(error.response.data));
      
      return res.status(error.response.status).json({
        error: 'Login operation failed',
        details: error.response.data,
        status: error.response.status
      });
    } else if (error.request) {
      console.error('No response received from API');
      return res.status(500).json({ error: 'No response received from API' });
    } else {
      console.error('Error message:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }
});

// GET /api/user - Fetch user info using a token
app.get('/api/user', async (req, res) => {
  try {
    // Get token from query parameter or header
    const token = req.query.token || req.headers['x-csrf-token'];
    
    if (!token) {
      return res.status(400).json({ error: 'Authentication token is required' });
    }
    
    console.log('User info request received with token');
    console.log('Fetching user info from:', userUrl);
    
    // Fetch user info using token
    const userResponse = await axios.get(userUrl, {
      headers: {
        ...commonHeaders,
        'Cookie': token,
        'x-csrf-token': token
      }
    });

    console.log('User info response status:', userResponse.status);
    
    // Return just the user info
    res.json({
      message: 'User info retrieved successfully',
      userInfo: userResponse.data
    });
  } catch (error) {
    console.error('User info error:', error);
    
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', JSON.stringify(error.response.data));
      
      return res.status(error.response.status).json({
        error: 'Failed to retrieve user information',
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

// Keep the original combined endpoint for backward compatibility
app.post('/api/auth', async (req, res) => {
  try {
    console.log('Auth request received:', JSON.stringify({
      username: req.body.username,
      timestamp: new Date().toISOString()
    }));
    
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Step 1: Perform login
    const loginData = { username, password };
    console.log('Sending login request to:', loginUrl);
    
    const loginResponse = await axios.post(loginUrl, loginData, {
      headers: commonHeaders
    });

    console.log('Login response status:', loginResponse.status);

    const cookies = loginResponse.data.Cookies;
    if (!cookies) {
      return res.status(400).json({ error: 'No cookies found in login response' });
    }

    // Step 2: Fetch user info using cookies
    console.log('Fetching user info from:', userUrl);
    const userResponse = await axios.get(userUrl, {
      headers: {
        ...commonHeaders,
        'Cookie': cookies,
        'x-csrf-token': cookies
      }
    });

    console.log('User info response status:', userResponse.status);
    
    // Step 3: Return combined response
    res.json({
      message: 'Authentication and user info retrieval successful',
      loginResponse: loginResponse.data.Response,
      cookies,
      userInfo: userResponse.data
    });
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Detailed error logging
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', JSON.stringify(error.response.data));
      
      return res.status(error.response.status).json({
        error: 'Operation failed',
        details: error.response.data,
        status: error.response.status
      });
    } else if (error.request) {
      console.error('No response received from API');
      return res.status(500).json({ error: 'No response received from API' });
    } else {
      console.error('Error message:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }
});

// Modified timetable endpoint with improved error handling
app.get('/api/timetable', async (req, res) => {
  try {
    // Get cookie from query parameter or header
    const cookie = req.query.token || req.headers['x-csrf-token'];
    
    if (!cookie) {
      return res.status(400).json({ error: 'Missing token. Please provide token as query parameter or in x-csrf-token header' });
    }
    
    // API request configuration
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie,
        'X-CSRF-Token': cookie
      }
    };
    
    // Make request to the campus API
    const response = await axios.get(`${baseUrl}/api/auth/timetable/2`, config);
    
    // Return the data from the API
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching timetable:', error);
    
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

// Modified planner endpoint with improved error handling
app.get('/api/planner', async (req, res) => {
  try {
    // Get cookie from query parameter or header
    const cookie = req.query.token || req.headers['x-csrf-token'];
    
    if (!cookie) {
      return res.status(400).json({ error: 'Missing token. Please provide token as query parameter or in x-csrf-token header' });
    }
    
    // API request configuration
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie,
        'X-CSRF-Token': cookie
      },
      withCredentials: true
    };
    
    // Make request to the campus API
    const response = await axios.get(`${baseUrl}/api/auth/planner`, config);
    
    // Return the data from the API
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching planner data:', error);
    
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
  console.log(`CORS enabled for origin: http://localhost:5173`);
});