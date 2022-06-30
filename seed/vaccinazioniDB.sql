--
-- Database: `vaccinazioniDB`
--

CREATE DATABASE vaccinazioniDB;
\c vaccinazioniDB

--
-- Struttura della tabella "vaccino"
--

CREATE TABLE vaccino (
  id_vaccino SERIAL PRIMARY KEY,
  nome_vaccino varchar(30) NOT NULL,
  copertura INT NOT NULL
);


--
-- Dump dei dati per la tabella "vaccino"
--

INSERT INTO vaccino (nome_vaccino, copertura)
	VALUES
	('Vaxzevria', 270),
	('Comirnaty', 90),
	('Spikevax', 180);

-- --------------------------------------------------------

--
-- Struttura della tabella "lotto"
--

CREATE TABLE lotto (
  lotto varchar(50) NOT NULL,
  data_consegna DATE NOT NULL,
  vaccino INT NOT NULL,
  dosi INT NOT NULL,
  data_scadenza DATE NOT NULL
);

--
-- Indici e vincoli per la tabella "lotto"
--

ALTER TABLE lotto
  ADD PRIMARY KEY (lotto, data_consegna, vaccino),
  ADD CONSTRAINT lotto_FK_vaccino FOREIGN KEY(vaccino) REFERENCES vaccino(id_vaccino) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Dump dei dati per la tabella "lotto"
--

INSERT INTO lotto (lotto, data_consegna, vaccino, dosi, data_scadenza) 
	VALUES
	('FG4493', '2022-02-14', 2, 300, '2022-07-21'),
	('123456Z', '2021-03-16', 3, 710, '2021-07-21'),
	('CDE7845', '2022-04-13', 1, 200, '2022-12-15'),
	('000190A', '2022-05-18', 3, 270, '2022-12-25'),
	('ABV2856', '2022-06-09', 1, 100, '2023-01-09'),
	('SC2606', '2022-06-26', 2, 1000, '2023-06-26');

-- --------------------------------------------------------

--
-- Struttura della tabella "vaccinazione"
--

CREATE TABLE vaccinazione (
  lotto varchar(50) NOT NULL,
  data_consegna DATE NOT NULL,
  vaccino INT NOT NULL,
  codice_fiscale varchar(16) NOT NULL,
  timestamp_vc TIMESTAMP NOT NULL
);

--
-- Indici e vincoli per la tabella "vaccinazione"
--

ALTER TABLE vaccinazione
  ADD PRIMARY KEY (lotto, data_consegna, vaccino, codice_fiscale),
  ADD CONSTRAINT vaccinazione_FK_lotto FOREIGN KEY(lotto, data_consegna, vaccino) REFERENCES lotto(lotto, data_consegna, vaccino) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Dump dei dati per la tabella "vaccinazione"
--

INSERT INTO vaccinazione (lotto, data_consegna, vaccino, codice_fiscale, timestamp_vc) 
	VALUES
	('000190A', '2022-05-18', 3, 'GTTNDR80A03A271U', '2022-06-30 13:42:25'),
	('ABV2856', '2022-06-09', 1, 'RMGLRA71R68H501V', '2021-12-24 14:50:30'),
	('SC2606', '2022-06-26', 2, 'RGNGNN86E53F839L', '2022-04-17 14:30:00');