// API client for MariaDB backend
const API_BASE_URL = 'http://localhost:5000/api';

// Get all posts
export async function fetchAllPosts() {
    try {
        const response = await fetch(`${API_BASE_URL}/posts`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
}

// Get a single post by ID
export async function fetchPost(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${id}`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching post ${id}:`, error);
        throw error;
    }
}

// Create a new post
export async function createPost(post) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(post),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
}

// Update an existing post
export async function updatePost(id, post) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(post),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error updating post ${id}:`, error);
        throw error;
    }
}

// Delete a post
export async function deletePost(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error deleting post ${id}:`, error);
        throw error;
    }
}

// Generate sitemap
export async function fetchSitemap() {
    try {
        const response = await fetch(`${API_BASE_URL}/sitemap`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.text();
    } catch (error) {
        console.error('Error fetching sitemap:', error);
        throw error;
    }
}
