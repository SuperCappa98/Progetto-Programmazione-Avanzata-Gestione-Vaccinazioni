--
-- Database: `vaccinationsdb`
--

CREATE DATABASE vaccinationsdb;
\c vaccinationsdb

--
-- Structure of "vaccine" table
--

CREATE TABLE vaccine (
  vaccine_id SERIAL PRIMARY KEY,
  vaccine_name varchar(30) NOT NULL,
  coverage INT NOT NULL
);

--
-- Data dump for "vaccine" table 
--

INSERT INTO vaccine (vaccine_name, coverage)
	VALUES
	('vaxzevria', 270),
	('comirnaty', 90),
	('spikevax', 180);

-- --------------------------------------------------------

--
-- Structure of "batch" table
--

CREATE TABLE batch (
  batch varchar(50) NOT NULL,
  delivery_date DATE NOT NULL,
  vaccine INT NOT NULL,
  doses INT NOT NULL,
  expiration_date DATE NOT NULL
);

--
-- Indexes and constraints for the "batch" table
--

ALTER TABLE batch
  ADD PRIMARY KEY (batch, delivery_date, vaccine),
  ADD CONSTRAINT batch_FK_vaccine FOREIGN KEY(vaccine) REFERENCES vaccine(vaccine_id) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Data dump for "batch" table 
--

INSERT INTO batch (batch, delivery_date, vaccine, doses, expiration_date) 
	VALUES
	('FG4493', '2022-02-14', 2, 300, '2022-07-21'),
	('123456Z', '2021-03-16', 3, 710, '2021-07-21'),
	('CDE7845', '2022-04-13', 1, 200, '2022-12-15'),
	('000190A', '2022-05-18', 3, 270, '2022-12-25'),
	('ABV2856', '2022-06-09', 1, 100, '2023-01-09'),
	('SC2606', '2022-06-26', 2, 1000, '2023-06-26');

-- --------------------------------------------------------

--
-- Structure of "users" table
--

CREATE TABLE users (
  user_key varchar(16) PRIMARY KEY
);

--
-- Data dump for "users" table 
--

INSERT INTO users (user_key)
	VALUES
    ('GTTNDR80A03A271U'),
    ('RMGLRA71R68H501V'),
    ('RGNGNN86E53F839L');

-- --------------------------------------------------------

--
-- Structure of "vaccination" table
--

CREATE TABLE vaccination (
  batch varchar(50) NOT NULL,
  delivery_date DATE NOT NULL,
  vaccine INT NOT NULL,
  user_key varchar(16) NOT NULL,
  timestamp_vc TIMESTAMP NOT NULL
);

--
-- Indexes and constraints for the "vaccination" table
--

ALTER TABLE vaccination
  ADD PRIMARY KEY (batch, delivery_date, vaccine, user_key, timestamp_vc),
  ADD CONSTRAINT vaccination_FK_batch FOREIGN KEY(batch, delivery_date, vaccine) REFERENCES batch(batch, delivery_date, vaccine) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT vaccination_FK_users FOREIGN KEY(user_key) REFERENCES users(user_key) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Data dump for "vaccination" table 
--

INSERT INTO vaccination (batch, delivery_date, vaccine, user_key, timestamp_vc) 
	VALUES
	('000190A', '2022-05-18', 3, 'GTTNDR80A03A271U', '2022-06-30 13:42:25'),
	('ABV2856', '2022-06-09', 1, 'RMGLRA71R68H501V', '2021-12-24 14:50:30'),
	('SC2606', '2022-06-26', 2, 'RGNGNN86E53F839L', '2022-04-17 14:30:00');