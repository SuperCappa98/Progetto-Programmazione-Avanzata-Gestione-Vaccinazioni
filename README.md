# Progetto Programmazione Avanzata: Gestione Vaccinazioni


## Obiettivo del progetto
#funzionalità

## Diagrammi UML
### Diagramma dei casi d'uso
### Diagramma delle sequenze

## Richieste
#tabella rotte - get post - autenticazione
### /addVax
### /vaxList


## Pattern utilizzati
### Singleton
### DAO
### Factory Method
### Model - Controller
### Chain of Responsability

## Avvio del progetto
> Per poter eseguire il progetto è necessario avere installato [Docker](https://www.docker.com) sulla propria macchina.

Per procedere con l'esecuzione del progetto effettuare i seguenti passaggi:

 - Clonare la repository di progetto
 ```
git clone https://github.com/SuperCappa98/Progetto-Programmazione-Avanzata-Gestione-Vaccinazioni
```
- Creare un file ".env" all'interno della directory di progetto con i seguenti dati:
 ```
 SECRET_KEY=projectsecretkey
PGUSER=userpg
PGDATABASE=vaccinationsdb
PGHOST=dbpg
PGPASSWORD=passwordpg
PGPORT=5432
REDISHOST=redis
REDISPORT=6379
```
- Da terminale posizionarsi nella directory clonata
```
cd https://github.com/SuperCappa98/Progetto-Programmazione-Avanzata-Gestione-Vaccinazioni
 ```
 - Avviare i servizi tramite docker con i seguenti comandi:
 ```
 docker-compose build
 docker-compose up
 ```

## Test
Per l'esecuzione dei test è necessario importare il file [Test-Collection-Vaccinations.postman_collection.json](https://github.com/SuperCappa98/Progetto-Programmazione-Avanzata-Gestione-Vaccinazioni/blob/main/Test-Collection-Vaccinations.postman_collection.json) nel programma [Postman](https://www.postman.com).

I token JWT utilizzati per i test sono stati generati utilizzando  [JWT.IO](https://jwt.io/) con la chiave _projectsecretkey_.


## Librerie/Framework
 - [Node.JS ](https://nodejs.org/en/)
 - [Express](https://expressjs.com)
 - [Sequelize](https://sequelize.org)
 - [Postgres](https://www.postgresql.org)
 - [PDFKit](https://pdfkit.org)
 - [REDIS](https://redis.io)


## Autori

 - [Burini Lisa ](https://github.com/lisaburini)
 - [Cappanera Simone](https://github.com/SuperCappa98)
