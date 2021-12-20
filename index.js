/* eslint-disable no-console */
/* eslint-disable comma-dangle */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable import/extensions */
// const request = require('supertest');
const express = require('express');
const db = require('../database/index.js');

const app = express();

app.set('port', 3000);
app.use(express.json()); // Allows us to parse json

// Get a list of products
app.get('/products', (req, res) => {
  const count = req.query.count ? req.query.count : 5; // Number of products to return
  const page = req.query.page ? req.query.page : 1;
  const offset = ((page - 1) * count); // Specify which row to start selecting from
  db.query(`SELECT * FROM products LIMIT ${offset}, ${count}`, (err, data) => {
    if (err) {
      console.log(err);
    }
    res.send(data);
  });
});

// Get info for selected product
app.get('/products/info', (req, res) => {
  const { productId } = req.query;
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
      )) FROM features AS f WHERE f.product_id = ${productId})
    ) FROM products AS p WHERE p.id = ${productId}`, (err, data) => {
      if (err) {
        console.log(err);
      }
      const key = Object.keys(data[0])[0];
      res.send(data[0][key]);
  });
});

// Get all styles for selected product
app.get('/products/styles', (req, res) => {
  const styles = {};
  const { productId } = req.query;
  styles.product_id = productId;

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

    )) FROM styles AS s WHERE s.productId = ${productId}`, (err, data) => {
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

// Get all items related to selected product
app.get('/products/related', (req, res) => {
  const { productId } = req.query;
  db.query(`SELECT JSON_ARRAYAGG(related_product_id) FROM relatedProducts AS r WHERE r.current_product_id = ${productId}`, (err, data) => {
    if (err) {
      console.log(err);
    }
    const key = Object.keys(data[0])[0];
    res.send(data[0][key]);
  });
});

app.get('/loaderio-fe958348661a86d11a92cf73648005d3', (req, res) => {
  res.send('loaderio-fe958348661a86d11a92cf73648005d3');
});

app.listen(app.get('port'), () => {
  console.log('Now listening on port 3000');
});
