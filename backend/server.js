import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { processRelationships } from './utils/hierarchy.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for all origins (required for frontend deployment on Vercel)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Load user details from environment variables (with defaults)
const USER_ID = process.env.USER_ID || 'tanishgupta_24062026'; // We set current date as default if not specified
const EMAIL_ID = process.env.EMAIL_ID || 'tanishgupta.student@chitkara.edu.in'; // Placeholder, customizable via env
const COLLEGE_ROLL_NUMBER = process.env.COLLEGE_ROLL_NUMBER || '201099XXXX'; // Placeholder, customizable via env

/**
 * @route GET /bfhl
 * @desc Health check endpoint
 */
app.get('/bfhl', (req, res) => {
  res.status(200).json({
    status: 'active',
    message: 'Chitkara Full Stack Challenge Backend API is running.',
    endpoints: {
      post_relationships: '/bfhl (POST)'
    }
  });
});

/**
 * @route POST /bfhl
 * @desc Process node relationships to build hierarchies
 */
app.post('/bfhl', (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field "data" in request body.'
      });
    }

    if (!Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        error: 'Field "data" must be an array of strings.'
      });
    }

    // Process using the utility helper
    const result = processRelationships(data);

    // Build the final response format
    const response = {
      user_id: USER_ID,
      email_id: EMAIL_ID,
      college_roll_number: COLLEGE_ROLL_NUMBER,
      hierarchies: result.hierarchies,
      invalid_entries: result.invalid_entries,
      duplicate_edges: result.duplicate_edges,
      summary: result.summary
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error processing POST /bfhl:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while processing relationships.'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`User ID: ${USER_ID}`);
  console.log(`Email ID: ${EMAIL_ID}`);
  console.log(`Roll Number: ${COLLEGE_ROLL_NUMBER}`);
});
