-- Create the test database
CREATE DATABASE synchronization;
GO

USE synchronization

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


