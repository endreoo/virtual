const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = 5000;

// Create MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'scraper',
  password: 'Jk8$Qe3#Zp2!BnL9',
  database: 'properties',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Enable CORS for all routes
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('[Database] Connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('[Database] Connection failed:', err.message);
  });

app.get('/api/reservations', async (req, res) => {
  console.log('[API] Fetching reservations from database');
  try {
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
    console.error('[API] Database error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch reservations',
      details: error.message 
    });
  }
});

// Add update-notes endpoint
app.post('/api/cards/update-notes', async (req, res) => {
  console.log('[API] Updating card notes, request body:', req.body);
  try {
    const { cardId, notes } = req.body;
    
    if (!cardId) {
      console.log('[API] Error: Card ID is missing');
      return res.status(400).json({ 
        status: 'error',
        message: 'Card ID is required' 
      });
    }

    console.log(`[API] Executing update query for card ${cardId} with notes:`, notes);
    const [result] = await pool.execute(
      'UPDATE expedia_reservations SET notes = ? WHERE id = ?',
      [notes, cardId]
    );
    console.log('[API] Update result:', result);

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      console.log('[API] No rows were updated');
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

// Add do-not-charge endpoint
app.post('/api/cards/do-not-charge', async (req, res) => {
  console.log('[API] Processing do not charge request:', req.body);
  try {
    const { 
      reservation_id,
      amount_usd,
      payment_channel,
      expedia_reservation_id,
      created_at,
      type_of_transaction
    } = req.body;
    
    // Validate required fields
    if (!reservation_id || !amount_usd || !expedia_reservation_id) {
      console.log('[API] Missing required fields:', { reservation_id, amount_usd, expedia_reservation_id });
      return res.status(400).json({ 
        status: 'error',
        message: 'Missing required fields' 
      });
    }

    // First, get the hotel_id from expedia_reservations
    console.log('[API] Fetching hotel_id for reservation:', reservation_id);
    const [hotelRows] = await pool.execute(
      'SELECT hotel_id FROM expedia_reservations WHERE id = ?',
      [reservation_id]
    );
    console.log('[API] Hotel query result:', hotelRows);

    if (!hotelRows || hotelRows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Reservation not found'
      });
    }

    const hotel_id = hotelRows[0].hotel_id;
    console.log('[API] Found hotel_id:', hotel_id);

    // Format the created_at datetime for MySQL
    const formattedCreatedAt = new Date(created_at).toISOString().slice(0, 19).replace('T', ' ');
    console.log('[API] Formatted created_at:', formattedCreatedAt);

    // Insert transaction record
    const insertQuery = `
      INSERT INTO card_transactions (
        reservation_id,
        amount_usd,
        payment_channel,
        hotel_id,
        expedia_reservation_id,
        created_at,
        type_of_transaction
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const insertValues = [
      reservation_id,
      amount_usd,
      payment_channel,
      hotel_id,
      expedia_reservation_id,
      formattedCreatedAt,
      type_of_transaction
    ];

    console.log('[API] Executing insert query:', insertQuery.replace(/\s+/g, ' '));
    console.log('[API] With values:', insertValues);

    const [insertResult] = await pool.execute(insertQuery, insertValues);
    console.log('[API] Insert result:', insertResult);

    // Update reservation status
    const updateQuery = 'UPDATE expedia_reservations SET status = ? WHERE id = ?';
    const updateValues = ['Do Not Charge', reservation_id];

    console.log('[API] Executing update query:', updateQuery);
    console.log('[API] With values:', updateValues);

    const [updateResult] = await pool.execute(updateQuery, updateValues);
    console.log('[API] Update result:', updateResult);

    res.json({ 
      status: 'success',
      message: 'Do Not Charge processed successfully',
      transaction_id: insertResult.insertId,
      details: {
        transaction: insertResult,
        update: updateResult
      }
    });
  } catch (error) {
    console.error('[API] Error processing do not charge:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message || 'Failed to process do not charge request'
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`[Server] Started at http://0.0.0.0:${port}`);
  console.log('[Server] Press Ctrl+C to stop');
}); 