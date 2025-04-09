// API client for MariaDB backend
// Synology hostname/IP with port for the Flask API
const API_BASE_URL = 'https://api.orange-man.xyz/api';

// Error handling helper with CORS debugging
function handleApiError(error, operation) {
    // Check if it's a CORS error
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error(`CORS error during ${operation}:`, {
            message: 'This may be a CORS issue. Check that the server is running and CORS is properly configured.',
            details: error.message,
            API_BASE_URL
        });

        // Add debugging info
        console.log('Attempting CORS debug fetch to diagnose issues...');
        fetch(`${API_BASE_URL}/posts`, {
            method: 'OPTIONS',
            mode: 'cors'
        })
        .then(response => {
            console.log('CORS Debug - Response status:', response.status);
            console.log('CORS Debug - Response headers:', {
                'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
                'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
                'access-control-allow-headers': response.headers.get('access-control-allow-headers')
            });
        })
        .catch(debugError => {
            console.error('CORS Debug - Failed:', debugError);
        });
    } else {
        console.error(`Error during ${operation}:`, error);
    }
    throw error;
}

// Get all posts
export async function fetchAllPosts() {
    try {
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'GET',
            mode: 'cors', // Explicit CORS mode
            // credentials: 'include', // Removed - incompatible with Access-Control-Allow-Origin: '*'
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        handleApiError(error, 'fetchAllPosts');
    }
}

// Get a single post by ID
export async function fetchPost(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
            method: 'GET',
            mode: 'cors',
            // credentials: 'include', // Removed - incompatible with Access-Control-Allow-Origin: '*'
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        handleApiError(error, `fetchPost(${id})`);
    }
}

// Create a new post
export async function createPost(post) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            mode: 'cors',
            // credentials: 'include', // Removed - incompatible with Access-Control-Allow-Origin: '*'
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(post),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        handleApiError(error, 'createPost');
    }
}

// Update an existing post
export async function updatePost(id, post) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
            method: 'PUT',
            mode: 'cors',
            // credentials: 'include', // Removed - incompatible with Access-Control-Allow-Origin: '*'
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(post),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        handleApiError(error, `updatePost(${id})`);
    }
}

// Delete a post
export async function deletePost(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
            method: 'DELETE',
            mode: 'cors',
            // credentials: 'include', // Removed - incompatible with Access-Control-Allow-Origin: '*'
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        handleApiError(error, `deletePost(${id})`);
    }
}

// Generate sitemap
export async function fetchSitemap() {
    try {
        const response = await fetch(`${API_BASE_URL}/sitemap`, {
            method: 'GET',
            mode: 'cors',
            // credentials: 'include', // Removed - incompatible with Access-Control-Allow-Origin: '*'
            headers: {
                'Accept': 'application/xml'
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.text();
    } catch (error) {
        handleApiError(error, 'fetchSitemap');
    }
}
