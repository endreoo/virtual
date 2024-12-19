import express from 'express';
import cors from 'cors';
import axios from 'axios';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 5000;

// MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'scraper',
  password: 'Jk8$Qe3#Zp2!BnL9',
  database: 'properties',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('[Database] Connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('[Database] Connection failed:', err);
  });

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Flutterwave configuration
const FLUTTERWAVE_PUBLIC_KEY = process.env.FLUTTERWAVE_PUBLIC_KEY;
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FLUTTERWAVE_ENCRYPTION_KEY = process.env.FLUTTERWAVE_ENCRYPTION_KEY;
const FLUTTERWAVE_API_URL = 'https://api.flutterwave.com/v3';

// Encryption function for Flutterwave
function encryptPayload(data) {
  try {
    const key = FLUTTERWAVE_ENCRYPTION_KEY.padEnd(24, '0').slice(0, 24);
    const text = JSON.stringify(data);
    const cipher = crypto.createCipheriv('des-ede3', key, '');
    cipher.setAutoPadding(true);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  } catch (error) {
    console.error('[Encryption Error]:', error);
    throw new Error('Encryption failed: ' + error.message);
  }
}

// Enable CORS for all routes with detailed logging
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('[Request Headers]', req.headers);
  console.log('[Request Origin]', req.get('origin'));
  next();
});

// Add response logging middleware
app.use((req, res, next) => {
  const oldJson = res.json;
  res.json = function(data) {
    console.log('[Response]', data);
    return oldJson.call(this, data);
  };
  next();
});

// Add CORS headers explicitly for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept');
  next();
});

// Fetch reservations from database
app.get('/api/reservations', async (req, res) => {
  try {
    console.log('[API] Fetching reservations from database');
    
    const [rows] = await pool.execute(`
      SELECT 
        er.id,
        er.guestName,
        er.guestFullName,
        er.checkInDate,
        er.checkOutDate,
        CAST(er.bookingAmount AS DECIMAL(10,2)) as bookingAmount,
        CAST(er.remainingBalance AS DECIMAL(10,2)) as remainingBalance,
        COALESCE(er.status, 'Unknown') as status,
        er.cardNumber,
        er.expirationDate,
        er.cvv,
        er.card_status,
        er.fullSidePanelText,
        er.notes,
        CONCAT(
          CASE 
            WHEN er.bookingSource IS NOT NULL THEN er.bookingSource
            ELSE 'Unknown'
          END,
          CASE 
            WHEN er.bookedOn IS NOT NULL THEN CONCAT(' (booked ', DATE_FORMAT(er.bookedOn, '%c/%e/%y'), ')')
            ELSE ''
          END
        ) as bookingSource,
        er.bookingDate,
        er.created_at,
        er.updated_at,
        h.name as Hotel
      FROM expedia_reservations er
      LEFT JOIN hotels h ON er.hotel_id = h.id 
      ORDER BY er.created_at DESC
    `);

    // Format the response data
    const formattedRows = rows.map(row => ({
      ...row,
      bookingAmount: row.bookingAmount ? Number(row.bookingAmount) : null,
      remainingBalance: row.remainingBalance ? Number(row.remainingBalance) : null,
      checkInDate: row.checkInDate ? row.checkInDate.toISOString().split('T')[0] : null,
      checkOutDate: row.checkOutDate ? row.checkOutDate.toISOString().split('T')[0] : null,
      bookingDate: row.bookingDate ? row.bookingDate.toISOString().split('T')[0] : null,
      created_at: row.created_at ? row.created_at.toISOString() : null,
      updated_at: row.updated_at ? row.updated_at.toISOString() : null
    }));

    // Log sample data for debugging
    if (formattedRows.length > 0) {
      console.log('[API] Sample reservation data:', {
        id: formattedRows[0].id,
        status: formattedRows[0].status,
        bookingSource: formattedRows[0].bookingSource,
        Hotel: formattedRows[0].Hotel,
        fullSidePanelText: formattedRows[0].fullSidePanelText ? 'Present' : 'Missing'
      });
      
      // Log the first few characters of fullSidePanelText if present
      if (formattedRows[0].fullSidePanelText) {
        console.log('[API] First 100 chars of fullSidePanelText:', 
          formattedRows[0].fullSidePanelText.substring(0, 100));
      }
    }

    console.log(`[API] Found ${formattedRows.length} reservations`);
    res.json(formattedRows);
  } catch (error) {
    console.error('[Database Error]:', error);
    res.status(500).json({ 
      error: 'Failed to fetch reservations',
      details: error.message 
    });
  }
});

// Update notes endpoint
app.post('/api/cards/update-notes', async (req, res) => {
  try {
    const { cardId, notes } = req.body;
    
    if (!cardId) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Card ID is required' 
      });
    }

    const [result] = await pool.execute(
      'UPDATE expedia_reservations SET notes = ? WHERE id = ?',
      [notes, cardId]
    );

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Card not found or no changes made'
      });
    }

    res.json({ 
      status: 'success',
      message: 'Notes updated successfully',
      notes: notes
    });
  } catch (err) {
    console.error('[API] Error updating notes:', err);
    res.status(500).json({ 
      status: 'error',
      message: err.message || 'Failed to update notes'
    });
  }
});

// Flutterwave payment endpoint
app.post('/api/process-payment/flutterwave', async (req, res) => {
  try {
    const { amount, card, currency = 'USD', email = 'guest@hotelonline.co' } = req.body;
    
    console.log('[Flutterwave] Processing payment:', { amount, card });

    // Validate required fields
    if (!amount || !card) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount and card details are required' 
      });
    }

    // Create Flutterwave charge payload
    const payload = {
      card_number: card.number,
      cvv: card.cvv,
      expiry_month: card.expiryMonth,
      expiry_year: card.expiryYear,
      currency,
      amount,
      email,
      tx_ref: 'HOT-' + Date.now(),
      redirect_url: 'https://finance.hotelonline.co/payment/callback'
    };

    // Encrypt the payload
    const encryptedPayload = encryptPayload(payload);

    // Make request to Flutterwave API
    const response = await axios.post(`${FLUTTERWAVE_API_URL}/charges?type=card`, 
      { client: encryptedPayload },
      {
        headers: {
          'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    console.log('[Flutterwave] API Response:', response.data);

    if (response.data.status === 'success') {
      res.json({
        success: true,
        message: 'Payment initiated successfully',
        data: {
          transactionId: response.data.data.id,
          flwRef: response.data.data.flw_ref,
          redirectUrl: response.data.data.redirect_url,
          status: response.data.data.status
        }
      });
    } else {
      throw new Error(response.data.message || 'Payment processing failed');
    }
  } catch (error) {
    console.error('[Flutterwave Error]', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.message || error.message || 'Payment processing failed' 
    });
  }
});

// Add OPTIONS handler for preflight requests
app.options('*', cors());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(500).json({ error: err.message });
});

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`[Server] Started at http://0.0.0.0:${port}`);
  console.log('[Server] Press Ctrl+C to stop');
}); 