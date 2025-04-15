-- Database setup for blog MariaDB

-- Create database
CREATE DATABASE IF NOT EXISTS blog_db;

-- Create user and grant privileges
CREATE USER IF NOT EXISTS 'blog_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON blog_db.* TO 'blog_user'@'localhost';
FLUSH PRIVILEGES;

-- Use the database
USE blog_db;

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    date DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    view_count INT NOT NULL DEFAULT 0
);

-- Optional: Insert a sample post
INSERT INTO posts (id, title, content, date, updated_at) VALUES
('sample1', '마크다운 블로그 시작하기', '# 마크다운 블로그 시작하기\n\n안녕하세요! 이 블로그는 마크다운으로 작성된 첫 번째 포스트입니다.\n\n## 마크다운 사용법\n\n마크다운은 텍스트 형식의 문서를 HTML로 변환해주는 가벼운 마크업 언어입니다.', NOW(), NOW());
