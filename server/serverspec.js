const request = require('supertest');
const express = require('express');
const db = require('../database/index.js');

const app = express();

app.set('port', 3000);
app.use(express.json()); // Allows us to parse json

// Get a list of products
app.get('/products', (req, res) => {
  const count = req.query.count ? req.query.count : 5;
  const page = req.query.page ? req.query.page : 1;
  const offset = ((page - 1) * count); // Specify which row to start selecting from
  db.query(`SELECT * FROM products LIMIT ${offset}, ${count}`, (err, data) => {
    if (err) {
      console.log(err);
    }
    res.send(data);
  });
});

request(app)
  .get('/products')
  // .expect('Content-Type', /json/)
  .expect(200)
  .end((err, res) => {
    if (err) { console.log(err); }
  });
