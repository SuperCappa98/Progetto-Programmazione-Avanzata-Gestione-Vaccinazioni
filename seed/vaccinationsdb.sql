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
  vaccine_name varchar(30) UNIQUE NOT NULL,
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
  vaccine INT NOT NULL,
  expiration_date DATE NOT NULL,
  available_doses INT NOT NULL
);

--
-- Indexes and constraints for the "batch" table
--

ALTER TABLE batch
  ADD PRIMARY KEY (batch, vaccine),
  ADD CONSTRAINT batch_FK_vaccine FOREIGN KEY(vaccine) REFERENCES vaccine(vaccine_id) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Data dump for "batch" table 
--

INSERT INTO batch (batch, vaccine, available_doses, expiration_date) 
	VALUES
	('FG4493', 2, 300, '2022-07-21'),
	('123456Z', 3, 710, '2021-07-21'),
	('CDE7845', 1, 200, '2022-12-15'),
	('000190A', 3, 269, '2022-12-25'),
	('ABV2856', 1, 97, '2023-01-09'),
	('SC2606', 2, 998, '2023-06-26'),
  ('NODOSESBATCH', 1, 0, '2024-01-01'),
  ('A', 1, 981, '2023-01-01'),
  ('B', 2, 985, '2023-01-01'),
  ('C', 3, 985, '2023-01-01');


-- --------------------------------------------------------

--
-- Structure of "delivery" table
--

CREATE TABLE delivery (
  batch varchar(50) NOT NULL,
  vaccine INT NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_doses INT NOT NULL
);

--
-- Indexes and constraints for the "delivery" table
--

ALTER TABLE delivery
  ADD PRIMARY KEY (batch, vaccine, delivery_date),
  ADD CONSTRAINT delivery_FK_batch FOREIGN KEY(batch, vaccine) REFERENCES batch(batch, vaccine) ON DELETE RESTRICT ON UPDATE CASCADE;
 

--
-- Data dump for "delivery" table 
--

INSERT INTO delivery (batch, delivery_date, vaccine, delivery_doses) 
	VALUES
	('FG4493', '2022-02-14', 2, 300),
	('123456Z', '2021-03-16', 3, 710),
	('CDE7845', '2022-04-13', 1, 200),
	('000190A', '2022-05-18', 3, 270),
	('ABV2856', '2022-06-09', 1, 100),
	('SC2606', '2022-06-26', 2, 1000),
  ('A', '2015-01-01', 1, 1000),
  ('B', '2015-01-01', 2, 1000),
  ('C', '2015-01-01', 3, 1000);


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
    ('RGNGNN86E53F839L'),
    ('AAABBB80A03A000U'),
    ('NJBWMP51S60B629A'),
    ('MTTMHT43E30C100X'),
    ('KPNBQC49P44B219E'),
    ('MKOLGJ73R10C764I'),
    ('CSBLMJ40D70C759A'),
    ('ZYWNGS75T07I625Y'),
    ('GXDFPC46P09D005H'),
    ('HHMPNO70L23M172P'),
    ('VLTSRK37A68A031L'),
    ('CNGXCN66S29A304Q'),
    ('LMIRVS68S12G387D'),
    ('BSBBTD60H56I960U'),
    ('YNGDXW81C43H688F'),
    ('VDVBWI29S26L744I'),
    ('SQJKTG50R59H702Z');

    
    



-- --------------------------------------------------------

--
-- Structure of "vaccination" table
--

CREATE TABLE vaccination (
  batch varchar(50) NOT NULL,
  vaccine INT NOT NULL,
  user_key varchar(16) NOT NULL,
  timestamp_vc TIMESTAMP NOT NULL
);

--
-- Indexes and constraints for the "vaccination" table
--

ALTER TABLE vaccination
  ADD PRIMARY KEY (batch, vaccine, user_key, timestamp_vc),
  ADD CONSTRAINT vaccination_FK_batch FOREIGN KEY(batch, vaccine) REFERENCES batch(batch, vaccine) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT vaccination_FK_users FOREIGN KEY(user_key) REFERENCES users(user_key) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Data dump for "vaccination" table 
--

INSERT INTO vaccination (batch, vaccine, user_key, timestamp_vc) 
	VALUES
	('000190A', 3, 'GTTNDR80A03A271U', '2022-06-30 13:42:25'),
  ('ABV2856', 1, 'GTTNDR80A03A271U', '2020-04-28 11:42:15'),
  ('SC2606', 2, 'GTTNDR80A03A271U', '2019-05-22 19:45:05'),
  ('ABV2856', 1, 'RMGLRA71R68H501V', '2021-12-26 18:50:30'),
  ('ABV2856', 1, 'RMGLRA71R68H501V', '2019-12-26 18:50:30'),
	('SC2606', 2, 'RGNGNN86E53F839L', '2022-02-17 14:30:00'),
  ('A', 1, 'NJBWMP51S60B629A', '2015-01-02 15:00:00'),
  ('B', 2, 'NJBWMP51S60B629A', '2016-02-02 15:00:00'),
  ('C', 3, 'NJBWMP51S60B629A', '2017-03-02 15:00:00'),
  ('A', 1, 'MTTMHT43E30C100X', '2018-04-01 15:00:00'),
  ('B', 2, 'MTTMHT43E30C100X', '2019-05-01 15:00:00'),
  ('C', 3, 'MTTMHT43E30C100X', '2020-06-01 15:00:00'),
  ('A', 1, 'KPNBQC49P44B219E', '2021-07-01 15:00:00'),
  ('B', 2, 'KPNBQC49P44B219E', '2015-08-01 15:00:00'),
  ('C', 3, 'KPNBQC49P44B219E', '2016-09-01 15:00:00'),
  ('A', 1, 'MKOLGJ73R10C764I', '2017-10-01 15:00:00'),
  ('B', 2, 'MKOLGJ73R10C764I', '2018-11-01 15:00:00'),
  ('C', 3, 'MKOLGJ73R10C764I', '2019-12-01 15:00:00'),
  ('A', 1, 'CSBLMJ40D70C759A', '2020-05-01 15:00:00'),
  ('B', 2, 'CSBLMJ40D70C759A', '2021-05-01 15:00:00'),
  ('C', 3, 'CSBLMJ40D70C759A', '2016-05-01 15:00:00'),
  ('A', 1, 'ZYWNGS75T07I625Y', '2021-03-01 15:00:00'),
  ('B', 2, 'ZYWNGS75T07I625Y', '2021-03-01 15:00:00'),
  ('C', 3, 'ZYWNGS75T07I625Y', '2021-03-01 15:00:00'),
  ('A', 1, 'GXDFPC46P09D005H', '2021-03-01 15:00:00'),
  ('B', 2, 'GXDFPC46P09D005H', '2021-03-01 15:00:00'),
  ('C', 3, 'GXDFPC46P09D005H', '2021-03-01 15:00:00'),
  ('A', 1, 'HHMPNO70L23M172P', '2021-03-01 15:00:00'),
  ('B', 2, 'HHMPNO70L23M172P', '2021-03-01 15:00:00'),
  ('C', 3, 'HHMPNO70L23M172P', '2021-03-01 15:00:00'),
  ('A', 1, 'VLTSRK37A68A031L', '2021-03-01 15:00:00'),
  ('B', 2, 'VLTSRK37A68A031L', '2021-03-01 15:00:00'),
  ('C', 3, 'VLTSRK37A68A031L', '2021-03-01 15:00:00'),
  ('A', 1, 'CNGXCN66S29A304Q', '2021-03-01 15:00:00'),
  ('B', 2, 'CNGXCN66S29A304Q', '2021-03-01 15:00:00'),
  ('C', 3, 'CNGXCN66S29A304Q', '2021-03-01 15:00:00'),
  ('A', 1, 'LMIRVS68S12G387D', '2021-12-28 15:00:00'),
  ('B', 2, 'LMIRVS68S12G387D', '2021-12-28 15:00:00'),
  ('C', 3, 'LMIRVS68S12G387D', '2021-12-28 15:00:00'),
  ('A', 1, 'BSBBTD60H56I960U', '2021-12-28 15:00:00'),
  ('B', 2, 'BSBBTD60H56I960U', '2021-12-28 15:00:00'),
  ('C', 3, 'BSBBTD60H56I960U', '2021-12-28 15:00:00'),
  ('A', 1, 'YNGDXW81C43H688F', '2021-12-28 15:00:00'),
  ('B', 2, 'YNGDXW81C43H688F', '2021-12-28 15:00:00'),
  ('C', 3, 'YNGDXW81C43H688F', '2021-12-28 15:00:00'),
  ('A', 1, 'VDVBWI29S26L744I', '2021-12-28 15:00:00'),
  ('B', 2, 'VDVBWI29S26L744I', '2021-12-28 15:00:00'),
  ('C', 3, 'VDVBWI29S26L744I', '2021-12-28 15:00:00'),
  ('A', 1, 'SQJKTG50R59H702Z', '2021-12-28 15:00:00'),
  ('B', 2, 'SQJKTG50R59H702Z', '2021-12-28 15:00:00'),
  ('C', 3, 'SQJKTG50R59H702Z', '2021-12-28 15:00:00'),
  ('A', 1, 'CNGXCN66S29A304Q', '2022-02-01 15:00:00'),
  ('A', 1, 'NJBWMP51S60B629A', '2017-08-01 15:00:00'),
  ('A', 1, 'NJBWMP51S60B629A', '2018-09-01 15:00:00'),
  ('A', 1, 'NJBWMP51S60B629A', '2019-11-01 15:00:00'),
  ('A', 1, 'NJBWMP51S60B629A', '2020-06-01 15:00:00');

  


