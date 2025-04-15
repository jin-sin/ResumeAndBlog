// API client for MariaDB backend
// Synology hostname/IP with port for the Flask API
export const API_BASE_URL = 'https://api.orange-man.xyz/api';

// Import authentication utilities
import { addAuthHeader, isAuthenticated } from './auth.js';

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
            credentials: 'include', // Re-enable credentials
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
            credentials: 'include', // Re-enable credentials
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
        console.log('Creating post with data:', post);
        console.log('Request URL:', `${API_BASE_URL}/posts`);
        
        // Validate post data
        if (!post.id || !post.title || !post.content || !post.date) {
            console.error('Missing required fields in post data');
            throw new Error('Post data is incomplete');
        }
        
        // Check if authenticated
        if (!isAuthenticated()) {
            throw new Error('Authentication required for this operation');
        }
        
        // Ensure date is in correct format
        if (!(post.date instanceof String) && typeof post.date !== 'string') {
            post.date = new Date(post.date).toISOString();
        }
        
        const postData = JSON.stringify(post);
        console.log('Post data to send:', postData);
        
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: addAuthHeader({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }),
            body: postData,
        });

        console.log('Response status:', response.status);
        
        // Get text response first for debugging
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        if (!response.ok) {
            // Try to parse error response
            let errorDetail = 'Unknown error';
            try {
                const errorData = JSON.parse(responseText);
                errorDetail = errorData.error || errorDetail;
            } catch (e) {
                // If we can't parse JSON, use text response
                errorDetail = responseText || `HTTP error: ${response.status}`;
            }
            
            throw new Error(`API error: ${response.status} - ${errorDetail}`);
        }

        // Parse successful response
        try {
            return JSON.parse(responseText);
        } catch (e) {
            console.error('Error parsing JSON response:', e);
            return { success: true, responseText }; // Fallback
        }
    } catch (error) {
        handleApiError(error, 'createPost');
        throw error; // Re-throw so the calling code knows there was an error
    }
}

// Update an existing post
export async function updatePost(id, post) {
    try {
        console.log('Updating post:', id, post);
        
        // Check if authenticated
        if (!isAuthenticated()) {
            throw new Error('Authentication required for this operation');
        }
        
        const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
            method: 'PUT',
            mode: 'cors',
            credentials: 'include',
            headers: addAuthHeader({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }),
            body: JSON.stringify(post),
        });

        // Get text response first for debugging
        const responseText = await response.text();
        console.log('Update response text:', responseText);

        if (!response.ok) {
            let errorDetail = 'Unknown error';
            try {
                const errorData = JSON.parse(responseText);
                errorDetail = errorData.error || errorDetail;
            } catch (e) {
                errorDetail = responseText || `HTTP error: ${response.status}`;
            }
            
            throw new Error(`API error: ${response.status} - ${errorDetail}`);
        }

        // Parse successful response
        try {
            return JSON.parse(responseText);
        } catch (e) {
            console.error('Error parsing JSON response:', e);
            return { success: true, responseText }; // Fallback
        }
    } catch (error) {
        handleApiError(error, `updatePost(${id})`);
        throw error; // Re-throw so the calling code knows there was an error
    }
}

// Delete a post
export async function deletePost(id) {
    try {
        // Check if authenticated
        if (!isAuthenticated()) {
            throw new Error('Authentication required for this operation');
        }
        
        const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
            method: 'DELETE',
            mode: 'cors',
            credentials: 'include',
            headers: addAuthHeader({
                'Accept': 'application/json'
            })
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
            credentials: 'include', // Re-enable credentials
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
