Final project setup.
Requirements:
NodeJS
NPM 
MariaDB
Python 3.6 or 3.7

NodeJS:
Clone project to local environment and run npm init to setup and install required node dependancies.
To start the server run 'node  index.js' from the route directory of the project.
Server should start on port 4111

Python version 3.6 or 3.7:
Create python virtual environment either with python venv or conda and install pip packages.
Packages:
nltk
numpy
pandas
gensims
spacy
pyLDAvis
pprint
Tensorflow
KeyBERT

Update python environment directory in .env file in route directory of codebase.
Update /python/evaluate.py routes with local environment routes.

Database setup:
Install MariaDB and create database called FP.

CREATE DATABASE `FP` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;

Update all .env file with database connection details.

Create three tables with the following SQL:

CREATE TABLE `Rooms` (
  `roomName` varchar(100) DEFAULT NULL,
  `memberA` varchar(100) DEFAULT NULL,
  `memberB` varchar(100) DEFAULT NULL,
  `ATalkTime` varchar(100) DEFAULT NULL,
  `BTalkTime` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `pdfGenerated` tinyint(1) NOT NULL DEFAULT 0,
  `wordCloudGenerated` tinyint(1) NOT NULL DEFAULT 0,
  UNIQUE KEY `Rooms_UN` (`roomName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `Transcripts` (
  `RoomName` varchar(100) DEFAULT NULL,
  `transcriptSegment` text DEFAULT NULL,
  `speakerName` varchar(100) DEFAULT NULL,
  `labelA` varchar(100) DEFAULT NULL,
  `transcriptID` varchar(8) DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `api_keys` (
  `api_key` varchar(100) NOT NULL,
  `account_email` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `word_count` int(11) DEFAULT 0,
  `api_calls` int(11) DEFAULT 0,
  UNIQUE KEY `email_UN` (`account_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

