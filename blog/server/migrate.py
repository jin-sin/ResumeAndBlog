#!/usr/bin/env python3
# Migration script to import posts from localStorage JSON to MariaDB

import mysql.connector
import json
import sys
import datetime

# Load environment variables
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Database configuration from environment variables
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'blog_user'),
    'password': os.getenv('DB_PASSWORD', ''),  # Password from environment variable
    'database': os.getenv('DB_NAME', 'blog_db')
}

def connect_to_db():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        print("Successfully connected to database")
        return conn
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        sys.exit(1)

def import_posts(json_file):
    try:
        # Read JSON file
        with open(json_file, 'r', encoding='utf-8') as f:
            posts = json.load(f)

        if not posts:
            print("No posts found in the JSON file")
            return

        print(f"Found {len(posts)} posts to import")

        # Connect to database
        conn = connect_to_db()
        cursor = conn.cursor()

        # Import each post
        imported_count = 0
        for post in posts:
            # Validate required fields
            if not all(key in post for key in ['id', 'title', 'content', 'date']):
                print(f"Skipping post with missing fields: {post.get('id', 'unknown')}")
                continue

            # Try to parse date
            try:
                date_obj = datetime.datetime.fromisoformat(post['date'].replace('Z', '+00:00'))
            except ValueError:
                print(f"Error parsing date for post {post['id']}, using current date")
                date_obj = datetime.datetime.now()

            now = datetime.datetime.now()

            # Check if post already exists
            cursor.execute("SELECT id FROM posts WHERE id = %s", (post['id'],))
            existing = cursor.fetchone()

            if existing:
                # Update existing post
                cursor.execute(
                    "UPDATE posts SET title = %s, content = %s, updated_at = %s WHERE id = %s",
                    (post['title'], post['content'], now, post['id'])
                )
                print(f"Updated existing post: {post['id']}")
            else:
                # Insert new post with view_count if available
                view_count = post.get('view_count', 0)
                cursor.execute(
                    "INSERT INTO posts (id, title, content, date, updated_at, view_count) VALUES (%s, %s, %s, %s, %s, %s)",
                    (post['id'], post['title'], post['content'], date_obj, now, view_count)
                )
                imported_count += 1

        # Commit changes
        conn.commit()
        print(f"Successfully imported {imported_count} posts, updated {len(posts) - imported_count} existing posts")

        # Close connection
        cursor.close()
        conn.close()

    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error reading JSON file: {e}")
        sys.exit(1)
    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        sys.exit(1)

def add_view_count_column():
    print("Starting migration: adding view_count column to posts table...")
    
    try:
        # Connect to database
        conn = connect_to_db()
        cursor = conn.cursor()
        
        # Check if view_count column already exists
        cursor.execute("SHOW COLUMNS FROM posts LIKE 'view_count'")
        column_exists = cursor.fetchone()
        
        if column_exists:
            print("Column 'view_count' already exists in posts table.")
        else:
            # Add the view_count column with default value of 0
            cursor.execute("""
                ALTER TABLE posts 
                ADD COLUMN view_count INT NOT NULL DEFAULT 0
            """)
            conn.commit()
            print("Successfully added 'view_count' column to posts table.")
        
        # Close connection
        cursor.close()
        conn.close()
        
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python migrate.py <json_file> OR python migrate.py --add-view-count")
        sys.exit(1)

    if sys.argv[1] == "--add-view-count":
        add_view_count_column()
    else:
        json_file = sys.argv[1]
        import_posts(json_file)
