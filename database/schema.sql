-- Financial News Hub Database Schema
CREATE DATABASE IF NOT EXISTS financial_news_hub;
USE financial_news_hub;

-- News Sources Configuration
CREATE TABLE news_sources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    api_key_name VARCHAR(100) NOT NULL,
    base_url VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- News Categories
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Articles
CREATE TABLE articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    external_id VARCHAR(255),
    title TEXT NOT NULL,
    description TEXT,
    content LONGTEXT,
    url VARCHAR(500) NOT NULL,
    published_at DATETIME,
    author VARCHAR(255),
    source_id INT NOT NULL,
    category_id INT,
    keyword VARCHAR(255),
    news_type ENUM('financial', 'general', 'keyword') DEFAULT 'general',
    image_url VARCHAR(500),
    is_enhanced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (source_id) REFERENCES news_sources(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_published_at (published_at),
    INDEX idx_source_category (source_id, category_id),
    INDEX idx_keyword (keyword),
    INDEX idx_news_type (news_type),
    UNIQUE KEY unique_article (external_id, source_id)
);

-- Fetch Jobs (for tracking automated fetching)
CREATE TABLE fetch_jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    keyword VARCHAR(255) NOT NULL,
    news_type ENUM('financial', 'general', 'keyword') DEFAULT 'general',
    articles_per_source INT DEFAULT 5,
    source_ids JSON, -- Array of source IDs to fetch from
    status ENUM('pending', 'running', 'completed', 'failed') DEFAULT 'pending',
    articles_fetched INT DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Settings (for storing frontend preferences)
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default news sources
INSERT INTO news_sources (name, api_key_name, base_url) VALUES 
('NewsAPI', 'NEWSAPIORG', 'https://newsapi.org/v2'),
('Guardian', 'THEGUARDIANOPENPLATFORM', 'https://content.guardianapis.com'),
('Alpha Vantage', 'ALPHAVANTAGE', 'https://www.alphavantage.co/query');

-- Insert default categories
INSERT INTO categories (name, slug) VALUES 
('Technology', 'technology'),
('Finance', 'finance'),
('Cryptocurrency', 'crypto'),
('Business', 'business'),
('Markets', 'markets'),
('Economy', 'economy');

-- Insert default settings
INSERT INTO settings (setting_key, setting_value) VALUES 
('default_articles_per_source', '5'),
('auto_fetch_enabled', 'false'),
('auto_fetch_interval_hours', '24'),
('default_news_type', '"general"');