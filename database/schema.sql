DROP DATABASE IF EXISTS productOverview;

CREATE DATABASE productOverview;

USE productOverview;


CREATE TABLE products (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(20),
  slogan VARCHAR(50),
  description VARCHAR(200),
  category VARCHAR(40),
  default_price VARCHAR(20),
  PRIMARY KEY (id)
);

LOAD DATA LOCAL INFILE './product.csv'
INTO TABLE products
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

CREATE TABLE features (
  id INT NOT NULL AUTO_INCREMENT,
  product_id INT,
  feature VARCHAR(20),
  value VARCHAR(40),
  PRIMARY KEY (id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

LOAD DATA LOCAL INFILE './features.csv'
INTO TABLE features
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

CREATE TABLE relatedProducts (
  id INT NOT NULL AUTO_INCREMENT,
  current_product_id INT,
  related_product_id INT,
  PRIMARY KEY (id),
  FOREIGN KEY (current_product_id) REFERENCES products(id)
);

LOAD DATA LOCAL INFILE './related.csv'
INTO TABLE relatedProducts
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

CREATE TABLE styles (
  id INT NOT NULL AUTO_INCREMENT,
  productId INT,
  name VARCHAR(20),
  sale_price VARCHAR(20),
  original_price VARCHAR(20),
  default_style BOOLEAN,
  PRIMARY KEY (id),
  FOREIGN KEY (productId) REFERENCES products(id)
);

LOAD DATA LOCAL INFILE './styles.csv'
INTO TABLE styles
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

CREATE TABLE photos (
  id INT NOT NULL AUTO_INCREMENT,
  styleId INT,
  url TEXT,
  thumbnail_url TEXT,
  PRIMARY KEY (id),
  FOREIGN KEY (styleId) REFERENCES styles(id)
);

LOAD DATA LOCAL INFILE './photos.csv'
INTO TABLE photos
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

CREATE TABLE skus (
  id INT NOT NULL AUTO_INCREMENT,
  styleId INT,
  size VARCHAR(3),
  quantity INT,
  PRIMARY KEY (id),
  FOREIGN KEY (styleId) REFERENCES styles(id)
);

LOAD DATA LOCAL INFILE './skus.csv'
INTO TABLE skus
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
