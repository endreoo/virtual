import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5169', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(join(__dirname, '../dist')));

const pool = mysql.createPool({
  host: 'localhost',
  user: 'scraper',
  password: 'Jk8$Qe3#Zp2!BnL9',
  database: 'properties',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Validate database connection
const validateConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

// API Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

app.get('/api/reservations', async (req, res) => {
  try {
    console.log('Attempting to fetch reservations...');
    
    // First, let's check if the table exists
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'properties' 
      AND TABLE_NAME = 'expedia_reservations'
    `);
    
    if (tables.length === 0) {
      throw new Error('Expedia reservations table not found');
    }

    // Get table structure
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'properties' 
      AND TABLE_NAME = 'expedia_reservations'
    `);
    
    console.log('Table columns:', columns.map(col => col.COLUMN_NAME));

    const [rows] = await pool.query(`
      SELECT * FROM expedia_reservations 
      WHERE remainingBalance >= 0.5
      AND checkInDate >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)
      ORDER BY checkInDate DESC
    `);
    
    console.log(`Successfully retrieved ${rows.length} reservations`);
    
    const formattedRows = rows.map(row => ({
      id: row.id,
      guestName: row.guestName || row.guestFullName || '',
      confirmationCode: row.confirmationCode || '',
      checkInDate: row.checkInDate ? new Date(row.checkInDate).toISOString().split('T')[0] : null,
      checkOutDate: row.checkOutDate ? new Date(row.checkOutDate).toISOString().split('T')[0] : null,
      bookingAmount: parseFloat(row.bookingAmount || 0),
      remainingBalance: parseFloat(row.remainingBalance || 0),
      status: row.reservationStatus || row.status || 'pending',
      bookingSource: row.bookingSource || 'Expedia',
      currency: row.currency || 'USD'
    }));

    console.log('First row sample:', rows[0]);
    console.log('Formatted first row:', formattedRows[0]);

    res.json(formattedRows);
  } catch (error) {
    console.error('Detailed error in /api/reservations:', {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      sql: error.sql,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to fetch reservations',
      details: error.message,
      sqlMessage: error.sqlMessage 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Serve index.html for all non-API routes (must be after API routes)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 5000;

// Start server only if database connection is successful
const startServer = async () => {
  const isConnected = await validateConnection();
  if (isConnected) {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('API endpoints:');
      console.log(`- GET http://localhost:${PORT}/api/reservations`);
      console.log(`- GET http://localhost:${PORT}/api/test`);
    });
  } else {
    console.error('Server startup failed due to database connection issues');
    process.exit(1);
  }
};

startServer(); 