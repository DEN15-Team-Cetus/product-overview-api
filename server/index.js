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
  db.query(
    `SELECT JSON_OBJECT(
      'id', p.id,
      'name', p.name,
      'slogan', p.slogan,
      'description', p.description,
      'category', p.category,
      'default_price', p.default_price,
      'features', (SELECT JSON_ARRAYAGG(JSON_OBJECT(
        'feature', f.feature,
        'value', f.value
      )) FROM features AS f WHERE f.product_id = ${req.params.product_id})
    ) FROM products AS p WHERE p.id = ${req.params.product_id}`, (err, data) => {
      if (err) {
        console.log(err);
      }
      const key = Object.keys(data[0])[0];
      res.send(data[0][key]);
  });
});

// Return obj containing all styles for current product
app.get('/products/:product_id/styles', (req, res) => {
  const styles = {};
  styles.product_id = req.params.product_id;

  db.query(
    `SELECT JSON_ARRAYAGG(JSON_OBJECT(
      'style_id', s.id,
      'name', s.name,
      'original_price', s.original_price,
      'sale_price', IF(s.sale_price = 'null', 0, s.sale_price),
      'default?', IF(s.default_style = 1, true, false),

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
      const editedData = data.map((result) => {
        const key = Object.keys(result)[0];
        return result[key];
      });
      styles.results = editedData[0];
      res.send(styles);
  });
});

// Return array of product_ids related to current product
app.get('/products/:product_id/related', (req, res) => {
  db.query(`SELECT JSON_ARRAYAGG(related_product_id) FROM relatedProducts AS r WHERE r.current_product_id = ${req.params.product_id}`, (err, data) => {
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
