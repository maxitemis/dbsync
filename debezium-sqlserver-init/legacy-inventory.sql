-- Create the test database
CREATE DATABASE legacyDB;
GO

USE legacyDB;

-- Create and populate our products using a single insert with many rows
CREATE TABLE legacy_produkte (
                          id INTEGER IDENTITY(101,1) NOT NULL PRIMARY KEY,
                          name VARCHAR(255) NOT NULL,
                          beschreibung VARCHAR(512),
                          gewicht FLOAT
);
INSERT INTO legacy_produkte(name,beschreibung,gewicht)
VALUES ('scooter','Small 2-wheel scooter',3.14);
INSERT INTO legacy_produkte(name,beschreibung,gewicht)
VALUES ('car battery','12V car battery',8.1);
INSERT INTO legacy_produkte(name,beschreibung,gewicht)
VALUES ('12-pack drill bits','12-pack of drill bits with sizes ranging from #40 to #3',0.8);
INSERT INTO legacy_produkte(name,beschreibung,gewicht)
VALUES ('hammer','12oz carpenter''s hammer',0.75);
INSERT INTO legacy_produkte(name,beschreibung,gewicht)
VALUES ('hammer','14oz carpenter''s hammer',0.875);
INSERT INTO legacy_produkte(name,beschreibung,gewicht)
VALUES ('hammer','16oz carpenter''s hammer',1.0);
INSERT INTO legacy_produkte(name,beschreibung,gewicht)
VALUES ('rocks','box of assorted rocks',5.3);
INSERT INTO legacy_produkte(name,beschreibung,gewicht)
VALUES ('jacket','water resistent black wind breaker',0.1);
INSERT INTO legacy_produkte(name,beschreibung,gewicht)
VALUES ('spare tire','24 inch spare tire',22.2);


-- Create some customers ...
CREATE TABLE legacy_kunden (
                           id INTEGER IDENTITY(1001,1) NOT NULL PRIMARY KEY,
                           vorname VARCHAR(255) NOT NULL,
                           nachname VARCHAR(255) NOT NULL,
                           email VARCHAR(255) NOT NULL UNIQUE,
                           geburtstag DATE,
                           lastlogin DATETIME
);
INSERT INTO legacy_kunden(vorname,nachname,email,geburtstag)
VALUES ('Sally','Thomas','sally.thomas@acme.com', '1978-09-01');
INSERT INTO legacy_kunden(vorname,nachname,email,geburtstag)
VALUES ('George','Bailey','gbailey@foobar.com', '2001-09-01');
INSERT INTO legacy_kunden(vorname,nachname,email,geburtstag)
VALUES ('Edward','Walker','ed@walker.com', '2000-09-01');
INSERT INTO legacy_kunden(vorname,nachname,email,geburtstag)
VALUES ('Anne','Kretchmar','annek@noanswer.org', '1999-09-09');

-- Create some very simple legacy_bestellungen
CREATE TABLE legacy_bestellungen (
                        id INTEGER IDENTITY(10001,1) NOT NULL PRIMARY KEY,
                        bestellung_datum DATE,
                        kunde_id INTEGER NOT NULL,
                        quantity INTEGER NOT NULL,
                        produkt_id INTEGER NOT NULL,
                        FOREIGN KEY (kunde_id) REFERENCES legacy_kunden(id),
                        FOREIGN KEY (produkt_id) REFERENCES legacy_produkte(id)
);
INSERT INTO legacy_bestellungen(bestellung_datum,kunde_id,quantity,produkt_id)
VALUES ('16-JAN-2016', 1001, 1, 102);
INSERT INTO legacy_bestellungen(bestellung_datum,kunde_id,quantity,produkt_id)
VALUES ('17-JAN-2016', 1002, 2, 105);
INSERT INTO legacy_bestellungen(bestellung_datum,kunde_id,quantity,produkt_id)
VALUES ('19-FEB-2016', 1002, 2, 106);
INSERT INTO legacy_bestellungen(bestellung_datum,kunde_id,quantity,produkt_id)
VALUES ('21-FEB-2016', 1003, 1, 107);

GO
