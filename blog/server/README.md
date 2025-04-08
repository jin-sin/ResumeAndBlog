# Blog Backend with MariaDB

This directory contains the backend server for the blog, using Flask and MariaDB.

## Setup Instructions

### 1. Database Setup

First, create the database and user by running the SQL script:

```bash
sudo mysql -u root -p < db_setup.sql
```

Or connect to MariaDB and run the commands manually:

```sql
CREATE DATABASE IF NOT EXISTS blog_db;
CREATE USER IF NOT EXISTS 'blog_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON blog_db.* TO 'blog_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Install Python Dependencies

Create a virtual environment and install the dependencies:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure the Application

Create a `.env` file based on the example:

```bash
cp .env.example .env
```

Then edit the `.env` file with your database credentials:

```
DB_HOST=localhost
DB_USER=blog_user
DB_PASSWORD=your_secure_password
DB_NAME=blog_db
BASE_URL=https://your-domain.com
```

This approach keeps your sensitive credentials out of the source code.

### 4. Run the Server

```bash
python app.py
```

The server will run on http://localhost:5000

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/posts` | GET | Get all posts |
| `/api/posts/<post_id>` | GET | Get a specific post |
| `/api/posts` | POST | Create a new post |
| `/api/posts/<post_id>` | PUT | Update a post |
| `/api/posts/<post_id>` | DELETE | Delete a post |
| `/api/sitemap` | GET | Generate sitemap.xml |

## Frontend Integration

The frontend code has been updated to communicate with this backend. Update the API base URL in `/blog/js/api.js` if your server runs on a different host or port:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## Migrating from localStorage

To migrate existing posts from localStorage to the database, use the migration utility in the frontend:

1. Navigate to `/blog/admin.html` and log in
2. Click on "Migrate to Database" in the admin panel
3. This will transfer all posts from localStorage to the MariaDB database