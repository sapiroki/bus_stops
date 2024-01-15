const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'khzmujd6Gh',
    database: 'bus_stop_db',
  });
  
  db.connect((err) => {
    if (err) {
      console.error('Database connection error: ', err.stack);
      return;
    }
    console.log('Connected to database as id ', db.threadId);
  });
  
  app.use(bodyParser.json());
  app.use(express.static('public')); 

  app.get('/regions', (req, res) => {
    db.query('SELECT DISTINCT zone_name FROM stops', (err, results) => {
      if (err) throw err;
      const regions = results.map(result => result.zone_name);
      res.json({ regions });
    });
  });
  
  app.post('/stops', (req, res) => {
    const region = req.body.region;
  
    db.query('SELECT stop_name FROM stops WHERE zone_name = ?', [region], (err, results) => {
      if (err) throw err;
      const stops = results.map(result => result.stop_name);
      res.json({ stops });
    });
  });
  
  app.post('/buses', (req, res) => {
    const stop = req.body.stop;
  
    db.query(`
      SELECT DISTINCT route_short_name 
      FROM routes 
      JOIN trips ON routes.route_id = trips.route_id 
      JOIN stop_times ON trips.trip_id = stop_times.trip_id 
      JOIN stops ON stop_times.stop_id = stops.stop_id 
      WHERE stops.stop_name = ?
    `, [stop], (err, results) => {
      if (err) throw err;
      const buses = results.map(result => result.route_short_name);
      res.json({ buses });
    });
  });

  app.post('/autocomplete', (req, res) => {
    const term = req.body.term;
  
    db.query(`
      SELECT DISTINCT zone_name 
      FROM stops 
      WHERE zone_name LIKE ?
    `, [`${term}%`], (err, results) => {
      if (err) throw err;
      const suggestions = results.map(result => result.zone_name);
      res.json({ suggestions });
    });
  });
  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });