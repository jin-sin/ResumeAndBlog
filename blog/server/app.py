#!/usr/bin/env python3
# Blog Backend API for MariaDB

from flask import Flask, request, jsonify, abort
from flask_cors import CORS
import mysql.connector
import json
import os
import datetime

app = Flask(__name__)
# Disable Flask-CORS to avoid conflicts with our custom middleware
# CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Custom CORS middleware with explicit header setting
@app.after_request
def add_cors_headers(response):
    # Enhanced CORS debugging
    print(f"\n==== CORS DEBUG ====")
    print(f"Request Method: {request.method}")
    print(f"Request Path: {request.path}")
    print(f"Request Headers: {dict(request.headers)}")

    origin = request.headers.get('Origin')
    print(f"Origin Header: {origin}")

    if origin:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Vary'] = 'Origin'
        print(f"Setting Access-Control-Allow-Origin to: {origin}")
    else:
        print("WARNING: No Origin header found in request!")

    # Allow credentials
    response.headers['Access-Control-Allow-Credentials'] = 'true'

    # Allow specific headers
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Authorization, X-Requested-With'

    # Allow specific methods
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'

    # Max age for preflight requests
    response.headers['Access-Control-Max-Age'] = '3600'

    # Add response headers debugging
    print(f"Response Status: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"==== END CORS DEBUG ====\n")

    return response

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
                    updated_at DATETIME NOT NULL,
                    view_count INT NOT NULL DEFAULT 0
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

# Handle OPTIONS requests for CORS preflight - explicit headers for OPTIONS
@app.route('/api/posts', methods=['OPTIONS'])
@app.route('/api/posts/<post_id>', methods=['OPTIONS'])
@app.route('/api/sitemap', methods=['OPTIONS'])
def handle_options(post_id=None):
    print(f"\n==== OPTIONS REQUEST DEBUG ====")
    print(f"OPTIONS Request Headers: {dict(request.headers)}")
    print(f"Access-Control-Request-Method: {request.headers.get('Access-Control-Request-Method')}")
    print(f"Access-Control-Request-Headers: {request.headers.get('Access-Control-Request-Headers')}")

    # Create response with 200 OK status
    response = jsonify({'success': True})
    response.status_code = 200

    # Get the origin and set appropriate headers
    origin = request.headers.get('Origin')
    print(f"Origin: {origin}")

    if origin:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Vary'] = 'Origin'

    # Handle requested method
    requested_method = request.headers.get('Access-Control-Request-Method')
    if requested_method:
        response.headers['Access-Control-Allow-Methods'] = requested_method
    else:
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'

    # Handle requested headers
    requested_headers = request.headers.get('Access-Control-Request-Headers')
    if requested_headers:
        response.headers['Access-Control-Allow-Headers'] = requested_headers
    else:
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Authorization, X-Requested-With'

    # Enable credentials
    response.headers['Access-Control-Allow-Credentials'] = 'true'

    # Set preflight cache duration
    response.headers['Access-Control-Max-Age'] = '3600'

    print(f"OPTIONS Response Headers: {dict(response.headers)}")
    print(f"==== END OPTIONS REQUEST DEBUG ====\n")

    return response

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
        # First, get the post
        cursor.execute("SELECT * FROM posts WHERE id = %s", (post_id,))
        post = cursor.fetchone()

        if post:
            # Increment view count
            cursor.execute(
                "UPDATE posts SET view_count = view_count + 1 WHERE id = %s",
                (post_id,)
            )
            conn.commit()

            # Return the post with updated view count
            post['view_count'] += 1  # Update in-memory as well
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
    # Enhanced debugging for request data
    print("\n==== CREATE POST REQUEST ====")
    print(f"Headers: {dict(request.headers)}")
    print(f"Content-Type: {request.content_type}")
    print(f"Request Data: {request.data}")

    # Parse request data with detailed error handling
    try:
        data = request.get_json(force=True, silent=True)
        if data is None:
            print("ERROR: Failed to parse JSON data")
            return jsonify({"error": "Invalid JSON data"}), 400
        print(f"Parsed JSON data: {data}")
    except Exception as e:
        print(f"ERROR parsing JSON: {str(e)}")
        return jsonify({"error": f"Failed to parse JSON: {str(e)}"}), 400

    conn = get_db_connection()
    if not conn:
        print("ERROR: Database connection failed")
        return jsonify({"error": "Database connection failed"}), 500

    # Validate required fields
    required_fields = ['id', 'title', 'content', 'date']
    for field in required_fields:
        if field not in data:
            print(f"ERROR: Missing required field: {field}")
            return jsonify({"error": f"Missing required field: {field}"}), 400

    print("All required fields present, creating post...")
    cursor = conn.cursor()
    try:
        now = datetime.datetime.now()
        # Handle date parsing with error handling
        try:
            input_date = data['date']
            if isinstance(input_date, str):
                # Try to parse the date string
                parsed_date = datetime.datetime.fromisoformat(input_date.replace('Z', '+00:00'))
            else:
                parsed_date = input_date

            # Debug the date values
            print(f"Input date: {input_date}, Parsed date: {parsed_date}")
        except Exception as e:
            print(f"ERROR parsing date: {str(e)}")
            return jsonify({"error": f"Invalid date format: {str(e)}"}), 400

        # Execute the insert query
        try:
            print(f"Executing SQL with values: id={data['id']}, title={data['title']}, content_len={len(data['content'])}, date={parsed_date}, now={now}")
            cursor.execute(
                "INSERT INTO posts (id, title, content, date, updated_at, view_count) VALUES (%s, %s, %s, %s, %s, %s)",
                (data['id'], data['title'], data['content'], parsed_date, now, data.get('view_count', 0))
            )
            conn.commit()
            print("Post created successfully")
            return jsonify({"success": True, "id": data['id']}), 201
        except mysql.connector.Error as err:
            print(f"Database error: {err}")
            return jsonify({"error": f"Database error: {str(err)}"}), 500
    except Exception as e:
        print(f"Unexpected error creating post: {str(e)}")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500
    finally:
        cursor.close()
        conn.close()
        print("Database connection closed")

# Update an existing post
@app.route('/api/posts/<post_id>', methods=['PUT'])
def update_post(post_id):
    # Enhanced request debugging
    print("\n==== UPDATE POST REQUEST ====")
    print(f"Headers: {dict(request.headers)}")
    print(f"Content-Type: {request.content_type}")
    print(f"Request Data: {request.data}")
    print(f"Post ID: {post_id}")

    conn = get_db_connection()
    if not conn:
        print("ERROR: Database connection failed")
        return jsonify({"error": "Database connection failed"}), 500

    # Parse request data with detailed error handling
    try:
        # Check if the request is JSON
        if not request.is_json:
            print(f"ERROR: Request is not JSON. Content-Type: {request.content_type}")
            return jsonify({"error": "Request must be JSON"}), 400

        # Try to parse JSON with detailed error handling
        try:
            data = request.get_json(force=False, silent=True)
            if data is None:
                print("ERROR: Failed to parse JSON data")
                return jsonify({"error": "Invalid JSON data"}), 400
            print(f"Parsed JSON data: {data}")
        except Exception as e:
            print(f"ERROR parsing JSON: {str(e)}")
            return jsonify({"error": f"Failed to parse JSON: {str(e)}"}), 400

        # Validate required fields
        required_fields = ['title', 'content']
        for field in required_fields:
            if field not in data:
                print(f"ERROR: Missing required field: {field}")
                return jsonify({"error": f"Missing required field: {field}"}), 400

        print("All required fields present, updating post...")
        cursor = conn.cursor()
        try:
            now = datetime.datetime.now()
            print(f"Executing SQL with values: title={data['title']}, content_len={len(data['content'])}, updated_at={now}, id={post_id}")

            # If view_count was provided, use it; otherwise, keep the existing value
            if 'view_count' in data:
                cursor.execute(
                    "UPDATE posts SET title = %s, content = %s, updated_at = %s, view_count = %s WHERE id = %s",
                    (data['title'], data['content'], now, data['view_count'], post_id)
                )
            else:
                cursor.execute(
                    "UPDATE posts SET title = %s, content = %s, updated_at = %s WHERE id = %s",
                    (data['title'], data['content'], now, post_id)
                )
            conn.commit()

            if cursor.rowcount == 0:
                print(f"ERROR: Post not found with ID: {post_id}")
                return jsonify({"error": "Post not found"}), 404

            print("Post updated successfully")
            return jsonify({"success": True, "id": post_id})
        except mysql.connector.Error as err:
            print(f"Database error: {err}")
            return jsonify({"error": f"Database error: {str(err)}"}), 500
    except Exception as e:
        print(f"Unexpected error updating post: {str(e)}")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        print("Database connection closed")
        print("==== END UPDATE POST REQUEST ====\n")

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

# Add detailed error logging
@app.errorhandler(Exception)
def handle_error(e):
    app.logger.error(f"Unhandled exception: {str(e)}")
    return jsonify({"error": str(e)}), 500

# Initialize database on startup
if __name__ == '__main__':
    init_db()
    # Use 0.0.0.0 to allow connections from any IP
    # Enable debug for development but disable in production
    app.run(host='0.0.0.0', debug=True, port=5501)
