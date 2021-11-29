/* eslint-disable no-console */
/* eslint-disable comma-dangle */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable import/extensions */
const express = require('express');
const db = require('../database/index.js');

const app = express();

app.set('port', 3000);
app.use(express.json()); // Allows us to parse json

// Return all products
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

// Return all info for current product
app.get('/products/:product_id', (req, res) => {
  const productInfo = {};
  db.query(`SELECT * FROM products WHERE id = ${req.params.product_id}`, (err, data) => {
    if (err) {
      console.log(err);
    }
    // Populate productInfo
    for (const key in data[0]) {
      productInfo[key] = data[0][key];
    }
  });

  const features = [];
  db.query(`SELECT * FROM features WHERE product_id = ${req.params.product_id}`, (err, data) => {
    if (err) {
      console.log(err);
    }
    // Populate features array
    data.forEach((obj) => {
      const featuresObj = {};
      featuresObj.feature = obj.feature;
      featuresObj.value = obj.value;
      features.push(featuresObj);
    });
    // Build response obj and send to client
    productInfo.features = features;
    res.send(productInfo);
  });
});

// Return obj containing all styles for current product
app.get('/products/:product_id/styles', (req, res) => {
  // Initialize styles object
  const styles = {};
  styles.product_id = req.params.product_id;

  // let results = []; // Array of objects. One object for each style_id
  db.query(
    `SELECT JSON_ARRAYAGG(JSON_OBJECT(
      'style_id', s.id,
      'name', s.name,
      'original_price', s.original_price,
      'sale_price', s.sale_price,
      'default?', s.default_style,

      'photos', (SELECT JSON_ARRAYAGG(JSON_OBJECT(
        'thumbnail_url', p.thumbnail_url,
        'url', url
      )) FROM photos AS p WHERE p.styleId = s.id),

      'skus', (SELECT JSON_OBJECTAGG(skus.id, JSON_OBJECT(
        'quantity', skus.quantity,
        'size', skus.size
      )) FROM skus AS skus WHERE skus.styleId = s.id)

    )) FROM styles AS s WHERE s.productId = ${req.params.product_id}`, (err, data) => {
      if (err) {
        console.log(err);
      }
      const fixed = data.map((result) => {
        const key = Object.keys(result)[0];
        return JSON.parse(result[key]);
      });
      styles.results = fixed[0];
      res.send(styles);
  });
});

// Return array of product_ids related to current product
app.get('/products/:product_id/related', (req, res) => {
  db.query(`SELECT CAST(CONCAT('[', GROUP_CONCAT(related_product_id SEPARATOR ','), ']') AS JSON ) FROM relatedProducts WHERE current_product_id = ${req.params.product_id}`, (err, data) => {
    if (err) {
      console.log(err);
    }
    const key = Object.keys(data[0])[0];
    res.send(data[0][key]);
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
