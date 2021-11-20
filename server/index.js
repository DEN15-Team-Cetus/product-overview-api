/* eslint-disable comma-dangle */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable import/extensions */
const path = require('path');
const express = require('express');
const db = require('../database/index.js');

const app = express();
// const { response } = require('express');

app.set('port', 3000);
app.use(express.json()); // Allows us to parse json

// Return list of products
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

// Return all product level info for specified product_id
app.get('/products/:product_id', (req, res) => {
  let productInfo = {};
  db.query(`SELECT * FROM products WHERE id = ${req.params.product_id}`, (err, data) => {
    if (err) {
      console.log(err);
    }
    // Populate productInfo
    for (let key in data[0]) {
      productInfo[key] = data[0][key];
    }
  });

  let features = [];
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

// Return obj containing all available styles for current product
app.get('/products/:product_id/styles', (req, res) => {
  let styles = {};
  styles.product_id = req.params.product_id;
  let results = [];
  db.query(`SELECT * FROM styles WHERE productId = ${req.params.product_id}`, (err, data) => {
    if (err) {
      console.log(err);
    }
    console.log(data);
    // For each obj in data, create a corresponding styleObj and push to results
    data.forEach((obj) => {
      let styleObj = {
        style_id: obj.id,
        name: obj.name,
        original_price: obj.original_price,
        sale_price: obj.sale_price ? obj.sale_price : '0',
        'default?': obj.default_style === 0,
        // photos: [],
        // skus: {}
      };
      // Populate photos array with obj{thumbnail_url, url} from photos table
      let photos = [];
      db.query(`SELECT * FROM photos WHERE styleId = ${obj.id}`, (err, data) => {
        if (err) {
          console.log(err);
        }
        console.log('PHOTOS FOR THIS STYLE ID:', data);
        data.forEach((obj) => {
          let photoObj = {
            thumbnail_url: '',
            url: ''
          };
        });
      });
      // Populate skus obj
    });
  });
  res.send(styles);
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

// Example query to return array of related_product_ids
// `SELECT array_agg(related.related_product_id) AS result FROM product LEFT JOIN (SELECT current_product_id, related_product_id FROM related) AS related ON product.id=related.current_product_id WHERE id=${id} GROUP BY product.id`

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
