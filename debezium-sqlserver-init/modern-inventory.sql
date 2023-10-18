-- Create the test database
CREATE DATABASE moderndb;

\c moderndb

-- Create and populate our products using a single insert with many rows
CREATE TABLE modern_products (
                                 id SERIAL NOT NULL PRIMARY KEY,
                                 name VARCHAR(255) NOT NULL,
                                 description VARCHAR(512),
                                 weight FLOAT
);

-- Create some modern_customers ...
CREATE TABLE modern_customers (
                                  id SERIAL NOT NULL PRIMARY KEY,
                                  first_name VARCHAR(255) NOT NULL,
                                  last_name VARCHAR(255) NOT NULL,
                                  email VARCHAR(255) NOT NULL UNIQUE,
                                  birthday DATE,
                                  lastlogin TIMESTAMP
);

CREATE TABLE test_modern_customers (
                                  id SERIAL NOT NULL PRIMARY KEY,
                                  first_name VARCHAR(255) NOT NULL,
                                  last_name VARCHAR(255) NOT NULL,
                                  email VARCHAR(255) NOT NULL UNIQUE,
                                  birthday DATE,
                                  lastlogin TIMESTAMP
);

-- Create some very simple modern_orders
CREATE TABLE modern_orders (
                               id SERIAL NOT NULL PRIMARY KEY,
                               order_date DATE,
                               purchaser INTEGER NOT NULL,
                               quantity INTEGER NOT NULL,
                               product_id INTEGER NOT NULL,
                               FOREIGN KEY (purchaser) REFERENCES modern_customers(id),
                               FOREIGN KEY (product_id) REFERENCES modern_products(id)
);


