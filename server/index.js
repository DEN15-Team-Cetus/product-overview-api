const path = require('path');
const express = require('express');
const app = express();
const db = require('../database/index.js');

app.set('port', 3000);
app.use(express.json()); // Allows us to parse json

// Return a list of products
app.get('/products', (req, res) => {
  let count = req.query.count ? req.query.count : 5;
  let page = req.query.page ? req.query.page : 1;
  let offset = ((page - 1) * count); // Specify which row to start selecting from
  db.query(`SELECT * FROM products LIMIT ${offset}, ${count}`, (err, data) => {
    if(err) {
      console.log(err);
    }
    res.send(data);
  });
});

// Return all product level info for specified product_id
// TODO: Need to include features array in the response object
app.get('/products/:product_id', (req, res) => {
  db.query(
    `SELECT *,
      (SELECT JSON_ARRAY(
        JSON_OBJECT('feature', 4000, 'value', 9999)
      )) AS features
    FROM products WHERE id = ${req.params.product_id}`, (err, data) => {
    if(err) {
      console.log(err);
    }
    res.send(data);
  });
});

// Return array of product_id's related to current product
app.get('/products/:product_id/related', (req, res) => {
  db.query(`SELECT current_product_id, related_product_id FROM relatedProducts WHERE current_product_id = ${req.params.product_id}`, (err, data) => {
    if(err) {
      console.log(err);
    }
    res.send(data);
  });
});

app.listen(app.get('port'), () => {
  console.log('Now listening on port 3000');
});

// TODO: Look into Supertest for testing. Call supertest functions from within Jest

// Example query to return data as an array:
// SELECT
//   id,
//   to_char(in_time, 'Dy MM.DD.YY') AS inDate,
//   to_char(out_time, 'Dy MM.DD.YY') AS outDate,
//   to_char( in_time, 'HH:MI am' ) AS inTime,
//   to_char( out_time, 'HH:MI am' ) AS outTime,
//   to_char( total_time, 'HH24h MIm SSs' ) AS totalTime,
//   in_time AS inTimeObj,
//   rate,
//   value,
//   (SELECT array(
//       SELECT t2.tag_name
//       FROM dev_logtags t1
//       LEFT JOIN dev_tags t2
//       ON t1.tag_id=t2.tag_id
//       WHERE log_id=dev_timelogs.id
//       GROUP BY t1.tag_id, t2.tag_name
//   ) AS TAGS)
// FROM dev_timelogs;

