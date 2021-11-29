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

  let results = []; // Array of objects. One object for each style_id
  // db.query(`SELECT * FROM styles WHERE productId = ${req.params.product_id}`, (err, data) => {
    db.query(`SELECT id AS style_id, name, original_price, sale_price, default_style AS 'default?' FROM styles WHERE productId = ${req.params.product_id}`, (err, data) => {
    if (err) {
      console.log(err);
    }
    results = data;
    styles.results = results;

    // Create photos array and add to current object

    // TODO: Convert default_style from a 1/0 to true/false
    res.send(styles);
  });
});

// const styleObj = {
//   style_id: stylesObj.id,
//   name: stylesObj.name,
//   original_price: stylesObj.original_price,
//   sale_price: stylesObj.sale_price === 'null' ? '0' : stylesObj.sale_price,
//   'default?': stylesObj.default_style === 0,
// };

// app.get('/products/:product_id/styles', (req, res) => {
//   // Initialize styles object
//   const styles = {};
//   styles.product_id = req.params.product_id;

//   const results = [];
//   db.query(`SELECT * FROM styles WHERE productId = ${req.params.product_id}`, (stylesErr, stylesData) => {
//     if (stylesErr) {
//       console.log(stylesErr);
//     }
//     const stylesPromise = new Promise((resolveStyles, rejectStyles) => {
//       stylesData.forEach((stylesObj) => {
//         const styleObj = {
//           style_id: stylesObj.id,
//           name: stylesObj.name,
//           original_price: stylesObj.original_price,
//           sale_price: stylesObj.sale_price === 'null' ? '0' : stylesObj.sale_price,
//           'default?': stylesObj.default_style === 0,
//         };

//         const photos = [];
//         db.query(`SELECT * FROM photos WHERE styleId = ${stylesObj.id}`, (photosErr, photosData) => {
//           if (photosErr) {
//             console.log(photosErr);
//           }
//           const photosPromise = new Promise((resolvePhotos, rejectPhotos) => {
//             photosData.forEach((photosObj) => {
//               const photoObj = {
//                 thumbnail_url: photosObj.thumbnail_url,
//                 url: photosObj.url
//               };
//               photos.push(photoObj);
//             });
//             // styleObj.photos = photos;
//             resolvePhotos();
//           });
//         });

//         // // Populate skus obj for current style_id
//         // const skus = {}; // skus obj might contain many objects
//         // db.query(`SELECT * FROM skus WHERE styleId = ${stylesObj.id}`, (skusErr, skusData) => {
//         //   if (skusErr) {
//         //     console.log(skusErr);
//         //   }
//         //   skusData.forEach((skusObj) => { // for each skusObj
//         //     const skuObj = {
//         //       quantity: skusObj.quantity,
//         //       size: skusObj.size
//         //     };
//         //     skus[skusObj.styleId] = skuObj;
//         //   });
//         // });
//         // styleObj.skus = skus;

//         results.push(styleObj);
//       });
//     });
//   });
// });

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
