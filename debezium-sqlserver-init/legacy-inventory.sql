-- Create the test database
CREATE DATABASE legacyDB;
GO

USE legacyDB;

-- Create and populate our products using a single insert with many rows
CREATE TABLE legacy_products (
                          id INTEGER IDENTITY(101,1) NOT NULL PRIMARY KEY,
                          name VARCHAR(255) NOT NULL,
                          description VARCHAR(512),
                          weight FLOAT
);
INSERT INTO legacy_products(name,description,weight)
VALUES ('scooter','Small 2-wheel scooter',3.14);
INSERT INTO legacy_products(name,description,weight)
VALUES ('car battery','12V car battery',8.1);
INSERT INTO legacy_products(name,description,weight)
VALUES ('12-pack drill bits','12-pack of drill bits with sizes ranging from #40 to #3',0.8);
INSERT INTO legacy_products(name,description,weight)
VALUES ('hammer','12oz carpenter''s hammer',0.75);
INSERT INTO legacy_products(name,description,weight)
VALUES ('hammer','14oz carpenter''s hammer',0.875);
INSERT INTO legacy_products(name,description,weight)
VALUES ('hammer','16oz carpenter''s hammer',1.0);
INSERT INTO legacy_products(name,description,weight)
VALUES ('rocks','box of assorted rocks',5.3);
INSERT INTO legacy_products(name,description,weight)
VALUES ('jacket','water resistent black wind breaker',0.1);
INSERT INTO legacy_products(name,description,weight)
VALUES ('spare tire','24 inch spare tire',22.2);


-- Create some customers ...
CREATE TABLE legacy_customers (
                           id INTEGER IDENTITY(1001,1) NOT NULL PRIMARY KEY,
                           first_name VARCHAR(255) NOT NULL,
                           last_name VARCHAR(255) NOT NULL,
                           email VARCHAR(255) NOT NULL UNIQUE,
                           birthday DATE,
                           lastlogin DATETIME
);
INSERT INTO legacy_customers(first_name,last_name,email,birthday)
VALUES ('Sally','Thomas','sally.thomas@acme.com', '1978-09-01');
INSERT INTO legacy_customers(first_name,last_name,email,birthday)
VALUES ('George','Bailey','gbailey@foobar.com', '2001-09-01');
INSERT INTO legacy_customers(first_name,last_name,email,birthday)
VALUES ('Edward','Walker','ed@walker.com', '2000-09-01');
INSERT INTO legacy_customers(first_name,last_name,email,birthday)
VALUES ('Anne','Kretchmar','annek@noanswer.org', '1999-09-09');

-- Create some very simple legacy_orders
CREATE TABLE legacy_orders (
                        id INTEGER IDENTITY(10001,1) NOT NULL PRIMARY KEY,
                        order_date DATE,
                        purchaser INTEGER NOT NULL,
                        quantity INTEGER NOT NULL,
                        product_id INTEGER NOT NULL,
                        FOREIGN KEY (purchaser) REFERENCES legacy_customers(id),
                        FOREIGN KEY (product_id) REFERENCES legacy_products(id)
);
INSERT INTO legacy_orders(order_date,purchaser,quantity,product_id)
VALUES ('16-JAN-2016', 1001, 1, 102);
INSERT INTO legacy_orders(order_date,purchaser,quantity,product_id)
VALUES ('17-JAN-2016', 1002, 2, 105);
INSERT INTO legacy_orders(order_date,purchaser,quantity,product_id)
VALUES ('19-FEB-2016', 1002, 2, 106);
INSERT INTO legacy_orders(order_date,purchaser,quantity,product_id)
VALUES ('21-FEB-2016', 1003, 1, 107);

GO
