CREATE DATABASE IF NOT EXISTS chat_app;

USE chat_app;

CREATE TABLE IF NOT EXISTS channels (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('public', 'private') NOT NULL,
    creator_username VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS channel_users (
    channel_id VARCHAR(255),
    username VARCHAR(255),
    FOREIGN KEY (channel_id) REFERENCES channels(id),
    FOREIGN KEY (username) REFERENCES users(username)
);

CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(255) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    channel VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (channel) REFERENCES channels(id),
    FOREIGN KEY (username) REFERENCES users(username)
);
