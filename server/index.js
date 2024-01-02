const express=require('express');
const cors=require('cors');
const mysql=require('mysql');
const bodyParser=require('body-parser');
const dotenv=require('dotenv');
const app=express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
  
dotenv.config();


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'FlightBooking',
  });
  
  db.connect((err) => {
    if (err) {
      console.error('Database connection failed: ' + err.stack);
      return;
    }
    console.log('Connected to MySQL database');
  });
  

app.get('/',(req,res)=>{
    res.send('Hello World');
});
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
  
    const sql = 'INSERT INTO register (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, password], (err, result) => {
      if (err) {
        console.error('Registration failed: ' + err.stack);
        res.status(500).send('Registration failed');
        return;
      }
      console.log('User registered successfully');
      res.status(200).send('User registered successfully');
    });
  });

  app.post('/login', (req, res) => {
    const { email, password } = req.body;
  
    const sql = 'SELECT * FROM register WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, result) => {
      if (err) {
        console.error('Login failed: ' + err.stack);
        res.status(500).send('Login failed');
        return;
      }
  
      if (result.length > 0) {
        console.log('Login successful');
        res.status(200).send('Login successful');
      } else {
        console.error('Invalid credentials');
        res.status(401).send('Invalid credentials');
      }
    });
  });
  app.get('/flights', (req, res) => {
    const sql = 'SELECT * FROM flights';
    db.query(sql, (err, result) => {
      if (err) {
        console.error('Error fetching flights: ' + err.stack);
        res.status(500).send('Error fetching flights');
        return;
      }
  
      res.json(result);
    });
  });

  app.post('/book', (req, res) => {
    const { userId, flightId } = req.body;
  
    // Check if the flight is available
    const checkAvailabilitySql = 'SELECT * FROM flights WHERE id = ? AND seats > 0';
    db.query(checkAvailabilitySql, [flightId], (checkErr, checkResult) => {
      if (checkErr) {
        console.error('Booking failed: ' + checkErr.stack);
        res.status(500).send('Booking failed');
        return;
      }
  
      if (checkResult.length === 0) {
        console.error('Flight not available or does not exist');
        res.status(400).send('Flight not available or does not exist');
        return;
      }
  
      // Book the flight and update available seats
      const bookFlightSql = 'INSERT INTO bookings (userId, flightId) VALUES (?, ?)';
      db.query(bookFlightSql, [userId, flightId], (bookErr, bookResult) => {
        if (bookErr) {
          console.error('Booking failed: ' + bookErr.stack);
          res.status(500).send('Booking failed');
          return;
        }
  
        // Update available seats
        const updateSeatsSql = 'UPDATE flights SET seats = seats - 1 WHERE id = ?';
        db.query(updateSeatsSql, [flightId], (updateErr, updateResult) => {
          if (updateErr) {
            console.error('Failed to update seats: ' + updateErr.stack);
            res.status(500).send('Booking failed');
            return;
          }
  
          console.log('Booking successful');
          res.status(200).send('Booking successful');
        });
      });
    });
  });
   
app.listen(5000,()=>{
    console.log('Server running on port 5000');
});