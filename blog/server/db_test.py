#!/usr/bin/env python3
# Database connection test script

import mysql.connector
import os
import sys
from dotenv import load_dotenv
import datetime

# Load environment variables
load_dotenv()

print("Database Connection Test Script")
print("===============================")

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'blog_user'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'blog_db')
}

print(f"Config: {DB_CONFIG.copy().update({'password': '*****'})}")

try:
    print("Connecting to database...")
    conn = mysql.connector.connect(**DB_CONFIG)
    print(f"Connected to MySQL server: {DB_CONFIG['host']}")
    print(f"MySQL version: {conn.get_server_info()}")
    
    cursor = conn.cursor()
    
    # Test database access
    print("\nChecking database tables...")
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    print(f"Tables in database: {[t[0] for t in tables]}")
    
    # Create test table if it doesn't exist
    print("\nCreating test table if it doesn't exist...")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS test_connection (
            id INT AUTO_INCREMENT PRIMARY KEY,
            message VARCHAR(255) NOT NULL,
            date DATETIME NOT NULL
        )
    ''')
    conn.commit()
    
    # Insert test data
    print("\nInserting test record...")
    now = datetime.datetime.now()
    cursor.execute(
        "INSERT INTO test_connection (message, date) VALUES (%s, %s)",
        (f"Connection test at {now}", now)
    )
    conn.commit()
    print(f"Inserted record with ID: {cursor.lastrowid}")
    
    # Read back data
    print("\nReading test data...")
    cursor.execute("SELECT * FROM test_connection ORDER BY id DESC LIMIT 5")
    rows = cursor.fetchall()
    for row in cursor.fetchall():
        print(f"  {row}")
    
    print("\nDatabase connection and operations successful!")
    
except mysql.connector.Error as err:
    print(f"ERROR: {err}")
    sys.exit(1)
finally:
    if 'cursor' in locals():
        cursor.close()
    if 'conn' in locals():
        conn.close()
    print("Connection closed")

print("\nTest complete.")