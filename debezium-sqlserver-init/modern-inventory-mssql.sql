-- Create the test database
CREATE DATABASE modernDB;
GO

USE modernDB

-- Create and populate our products using a single insert with many rows
CREATE TABLE modern_products (
                                 id INTEGER IDENTITY(101,1) NOT NULL PRIMARY KEY,
                                 name VARCHAR(255) NOT NULL,
                                 description VARCHAR(512),
                                 weight FLOAT
);

-- Create some modern_customers ...
CREATE TABLE modern_customers (
                                  id INTEGER IDENTITY(2001,1) NOT NULL PRIMARY KEY,
                                  vorname VARCHAR(255) NOT NULL,
                                  nachname VARCHAR(255) NOT NULL,
                                  email VARCHAR(255) NOT NULL UNIQUE,
                                  geburtstag DATE,
                                  lastlogin DATETIME
);

CREATE TABLE test_modern_customers (
                                  id INTEGER IDENTITY(2001,1) NOT NULL PRIMARY KEY,
                                  vorname VARCHAR(255) NOT NULL,
                                  nachname VARCHAR(255) NOT NULL,
                                  email VARCHAR(255) NOT NULL UNIQUE,
                                  geburtstag DATE,
                                  lastlogin DATETIME
);

-- Create some very simple modern_orders
CREATE TABLE modern_orders (
                               id INTEGER IDENTITY(10001,1) NOT NULL PRIMARY KEY,
                               order_date DATE,
                               purchaser INTEGER NOT NULL,
                               quantity INTEGER NOT NULL,
                               product_id INTEGER NOT NULL,
                               FOREIGN KEY (purchaser) REFERENCES modern_customers(id),
                               FOREIGN KEY (product_id) REFERENCES modern_products(id)
);

CREATE TABLE synchronization (
    id INTEGER IDENTITY(101,1) NOT NULL PRIMARY KEY,
    object_name VARCHAR(255) NOT NULL,
    modern_keys VARCHAR(512),
    legacy_keys VARCHAR(512),
    modern_hash VARCHAR(512),
    legacy_hash VARCHAR(512),
    version INTEGER NOT NULL
);

GO


