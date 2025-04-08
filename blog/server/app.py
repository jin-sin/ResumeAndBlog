#!/usr/bin/env python3
# Blog Backend API for MariaDB

from flask import Flask, request, jsonify, abort
from flask_cors import CORS
import mysql.connector
import json
import os
import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load environment variables
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database configuration from environment variables
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'blog_user'),
    'password': os.getenv('DB_PASSWORD', ''),  # Password from environment variable
    'database': os.getenv('DB_NAME', 'blog_db')
}

# Helper function to get database connection
def get_db_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None

# Helper to convert datetime objects to string for JSON serialization
def json_serial(obj):
    if isinstance(obj, datetime.datetime) or isinstance(obj, datetime.date):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

# Create database tables if they don't exist
def init_db():
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        try:
            # Create posts table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS posts (
                    id VARCHAR(50) PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    content TEXT NOT NULL,
                    date DATETIME NOT NULL,
                    updated_at DATETIME NOT NULL
                )
            ''')
            conn.commit()
            print("Database initialized successfully")
        except mysql.connector.Error as err:
            print(f"Error initializing database: {err}")
        finally:
            cursor.close()
            conn.close()
    else:
        print("Failed to initialize database: Could not connect")

# API Routes

# Get all posts
@app.route('/api/posts', methods=['GET'])
def get_posts():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM posts ORDER BY date DESC")
        posts = cursor.fetchall()
        return jsonify(json.loads(json.dumps(posts, default=json_serial)))
    except mysql.connector.Error as err:
        print(f"Error fetching posts: {err}")
        return jsonify({"error": "Failed to fetch posts"}), 500
    finally:
        cursor.close()
        conn.close()

# Get a specific post by ID
@app.route('/api/posts/<post_id>', methods=['GET'])
def get_post(post_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM posts WHERE id = %s", (post_id,))
        post = cursor.fetchone()

        if post:
            return jsonify(json.loads(json.dumps(post, default=json_serial)))
        else:
            return jsonify({"error": "Post not found"}), 404
    except mysql.connector.Error as err:
        print(f"Error fetching post: {err}")
        return jsonify({"error": "Failed to fetch post"}), 500
    finally:
        cursor.close()
        conn.close()

# Create a new post
@app.route('/api/posts', methods=['POST'])
def create_post():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()

    # Validate required fields
    required_fields = ['id', 'title', 'content', 'date']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    cursor = conn.cursor()
    try:
        now = datetime.datetime.now()
        cursor.execute(
            "INSERT INTO posts (id, title, content, date, updated_at) VALUES (%s, %s, %s, %s, %s)",
            (data['id'], data['title'], data['content'], data['date'], now)
        )
        conn.commit()
        return jsonify({"success": True, "id": data['id']}), 201
    except mysql.connector.Error as err:
        print(f"Error creating post: {err}")
        return jsonify({"error": "Failed to create post"}), 500
    finally:
        cursor.close()
        conn.close()

# Update an existing post
@app.route('/api/posts/<post_id>', methods=['PUT'])
def update_post(post_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()

    # Validate required fields
    required_fields = ['title', 'content']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    cursor = conn.cursor()
    try:
        now = datetime.datetime.now()
        cursor.execute(
            "UPDATE posts SET title = %s, content = %s, updated_at = %s WHERE id = %s",
            (data['title'], data['content'], now, post_id)
        )
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Post not found"}), 404

        return jsonify({"success": True, "id": post_id})
    except mysql.connector.Error as err:
        print(f"Error updating post: {err}")
        return jsonify({"error": "Failed to update post"}), 500
    finally:
        cursor.close()
        conn.close()

# Delete a post
@app.route('/api/posts/<post_id>', methods=['DELETE'])
def delete_post(post_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM posts WHERE id = %s", (post_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Post not found"}), 404

        return jsonify({"success": True})
    except mysql.connector.Error as err:
        print(f"Error deleting post: {err}")
        return jsonify({"error": "Failed to delete post"}), 500
    finally:
        cursor.close()
        conn.close()

# Generate sitemap.xml
@app.route('/api/sitemap', methods=['GET'])
def generate_sitemap():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, date FROM posts ORDER BY date DESC")
        posts = cursor.fetchall()

        # Get base URL from environment variable
        base_url = os.getenv('BASE_URL', 'https://orange-man.xyz')

        xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

        # Add homepage
        xml += '  <url>\n'
        xml += f'    <loc>{base_url}/resume.html</loc>\n'
        xml += '    <changefreq>monthly</changefreq>\n'
        xml += '    <priority>1.0</priority>\n'
        xml += '  </url>\n'

        # Add blog homepage
        xml += '  <url>\n'
        xml += f'    <loc>{base_url}/blog/index.html</loc>\n'
        xml += '    <changefreq>weekly</changefreq>\n'
        xml += '    <priority>0.9</priority>\n'
        xml += '  </url>\n'

        # Add blog posts
        for post in posts:
            post_url = f"{base_url}/blog/index.html#/post/{post['id']}"
            lastmod = post['date'].strftime('%Y-%m-%d')

            xml += '  <url>\n'
            xml += f'    <loc>{post_url}</loc>\n'
            xml += f'    <lastmod>{lastmod}</lastmod>\n'
            xml += '    <changefreq>monthly</changefreq>\n'
            xml += '    <priority>0.8</priority>\n'
            xml += '  </url>\n'

        # Close XML
        xml += '</urlset>'

        return xml, 200, {'Content-Type': 'application/xml'}
    except mysql.connector.Error as err:
        print(f"Error generating sitemap: {err}")
        return jsonify({"error": "Failed to generate sitemap"}), 500
    finally:
        cursor.close()
        conn.close()

# Initialize database on startup
if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
