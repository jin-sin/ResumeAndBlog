// Main blog functionality
import { renderMarkdown } from './markdown.js';
// Import for localStorage - comment out when using the database
// import { getAllPosts, getPost } from './storage.js';
// MariaDB API client for database operations
import { fetchAllPosts, fetchPost } from './api.js';

// DOM elements
const mainContent = document.getElementById('main-content');
const blogList = document.getElementById('blog-list');

// Router handling
function handleRoute() {
    const hash = window.location.hash || '#/';
    
    // Clear current content
    mainContent.innerHTML = '';
    
    if (hash === '#/') {
        showBlogList();
    } else if (hash.startsWith('#/post/')) {
        const postId = hash.replace('#/post/', '');
        showPost(postId);
    } else {
        // Redirect to home for any other route
        window.location.hash = '#/';
    }
}

// Show list of blog posts
async function showBlogList() {
    // Create blog list container
    const blogListElement = document.createElement('div');
    blogListElement.className = 'blog-list';
    mainContent.appendChild(blogListElement);
    
    try {
        // Get all posts from the database
        const posts = await fetchAllPosts();
        
        if (!posts || posts.length === 0) {
            blogListElement.innerHTML = '<p>아직 작성된 글이 없습니다.</p>';
            return;
        }
        
        // Sort posts by date (newest first)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'blog-card';
            
            // Create excerpt from content (first 150 characters)
            let excerpt = post.content.slice(0, 150);
            if (post.content.length > 150) excerpt += '...';
            
            postElement.innerHTML = `
                <div class="blog-card-content">
                    <h2 class="blog-title">${post.title}</h2>
                    <div class="blog-date">${new Date(post.date).toLocaleDateString()}</div>
                    <div class="blog-excerpt">${excerpt}</div>
                    <a href="#/post/${post.id}" class="read-more">더 읽기</a>
                </div>
            `;
            
            blogListElement.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        blogListElement.innerHTML = '<p>포스트를 불러오는 중 오류가 발생했습니다.</p>';
    }
}

// Show individual blog post
async function showPost(postId) {
    try {
        // Get post from the database
        const post = await fetchPost(postId);
        
        if (!post) {
            mainContent.innerHTML = '<p>글을 찾을 수 없습니다.</p>';
            return;
        }
    
    // Create back button container and button
    const backContainer = document.createElement('div');
    backContainer.style = 'max-width: 850px; margin: 0 auto;';
    
    const backButton = document.createElement('a');
    backButton.href = '#/';
    backButton.className = 'back-button';
    backButton.textContent = '← 목록으로';
    
    backContainer.appendChild(backButton);
    mainContent.appendChild(backContainer);
    
    const postElement = document.createElement('article');
    postElement.className = 'blog-post';
    
    const headerElement = document.createElement('header');
    headerElement.className = 'post-header';
    
    // Format date with options
    const dateOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    };
    const formattedDate = new Date(post.date).toLocaleDateString('ko-KR', dateOptions);
    
    headerElement.innerHTML = `
        <h1 class="post-title">${post.title}</h1>
        <div class="post-date">${formattedDate}</div>
    `;
    
    const contentElement = document.createElement('div');
    contentElement.className = 'post-content';
    contentElement.innerHTML = renderMarkdown(post.content);
    
    postElement.appendChild(headerElement);
    postElement.appendChild(contentElement);
    mainContent.appendChild(postElement);
    } catch (error) {
        console.error(`Error loading post ${postId}:`, error);
        mainContent.innerHTML = '<p>포스트를 불러오는 중 오류가 발생했습니다.</p>';
    }
}

// Update active navigation
function updateActiveNav() {
    // Find all nav links
    const navLinks = document.querySelectorAll('nav a');
    
    // Remove active class from all links
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current page link
    navLinks.forEach(link => {
        if (link.href.includes('/blog/index.html')) {
            link.classList.add('active');
        }
    });
}

// Initialize
window.addEventListener('hashchange', handleRoute);
document.addEventListener('DOMContentLoaded', () => {
    handleRoute();
    updateActiveNav();
});