// Admin functionality for blog management
import { renderMarkdown } from './markdown.js';
import { savePost, getAllPosts, getPost, deletePost } from './storage.js';

// DOM elements
const adminContent = document.getElementById('admin-content');
const loginSection = document.getElementById('login-section');
const adminPanel = document.getElementById('admin-panel');
const editorSection = document.getElementById('editor-section');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const postListElement = document.getElementById('post-list');

// Sample admin password - in a real app, this would be securely stored server-side
// This is just for demonstration purposes
const ADMIN_PASSWORD = 'admin123';
const AUTH_TOKEN_KEY = 'blog_admin_auth';

// Check if already logged in
function checkAuth() {
    const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (authToken === 'true') {
        showAdminPanel();
    }
}

// Handle login form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    
    if (password === ADMIN_PASSWORD) {
        // Store auth token (in a real app, this would be a secure JWT or similar)
        localStorage.setItem(AUTH_TOKEN_KEY, 'true');
        showAdminPanel();
    } else {
        loginError.style.display = 'block';
    }
});

// Handle logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    showLoginForm();
});

// Show admin panel with post list
async function showAdminPanel() {
    loginSection.classList.add('hidden');
    editorSection.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    
    // Load post list
    await loadPostList();
}

// Show login form
function showLoginForm() {
    adminPanel.classList.add('hidden');
    editorSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    loginError.style.display = 'none';
    document.getElementById('password').value = '';
}

// Load all posts for the admin panel
async function loadPostList() {
    const posts = await getAllPosts();
    
    if (posts.length === 0) {
        postListElement.innerHTML = '<p style="padding: 20px; text-align: center;">아직 작성된 글이 없습니다.</p>';
        return;
    }
    
    // Sort posts by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Clear post list
    postListElement.innerHTML = '';
    
    // Add each post to the list
    posts.forEach(post => {
        const postItem = document.createElement('div');
        postItem.className = 'post-item';
        
        postItem.innerHTML = `
            <div class="post-info">
                <div class="post-title">${post.title}</div>
                <div class="post-date">${new Date(post.date).toLocaleDateString()}</div>
            </div>
            <div class="post-actions">
                <a href="/blog/index.html#/post/${post.id}" class="view-btn" target="_blank">보기</a>
                <a href="#/edit/${post.id}" class="edit-btn">수정</a>
                <button class="delete-btn" data-id="${post.id}">삭제</button>
            </div>
        `;
        
        postListElement.appendChild(postItem);
    });
    
    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (confirm('정말로 이 글을 삭제하시겠습니까?')) {
                const postId = e.target.getAttribute('data-id');
                await deletePost(postId);
                await loadPostList();
            }
        });
    });
}

// Router handling
function handleRoute() {
    const hash = window.location.hash || '#/';
    
    // Check auth first
    if (!localStorage.getItem(AUTH_TOKEN_KEY)) {
        showLoginForm();
        return;
    }
    
    if (hash === '#/') {
        showAdminPanel();
    } else if (hash === '#/new') {
        showEditor();
    } else if (hash.startsWith('#/edit/')) {
        const postId = hash.replace('#/edit/', '');
        showEditor(postId);
    }
}

// Show post editor (new or edit)
async function showEditor(postId = null) {
    adminPanel.classList.add('hidden');
    loginSection.classList.add('hidden');
    editorSection.classList.remove('hidden');
    
    // Create editor UI
    editorSection.innerHTML = `
        <button id="back-to-admin" class="back-btn" style="margin-bottom: 20px;">← 목록으로</button>
        
        <div class="editor-container">
            <h2 style="margin-bottom: 20px;">${postId ? '글 수정' : '새 글 작성'}</h2>
            
            <form id="editor-form" class="editor-form">
                <label for="post-title">제목</label>
                <input type="text" id="post-title" name="title" required>
                
                <label for="post-content">내용 (마크다운 형식)</label>
                <textarea id="post-content" name="content" required></textarea>
                
                <div id="preview-container" class="preview-container" style="display: none;"></div>
                
                <div class="buttons-container">
                    <button type="submit" class="submit-btn">저장</button>
                    <button type="button" class="preview-btn" id="preview-btn">미리보기</button>
                </div>
            </form>
        </div>
    `;
    
    // Load post data if editing
    if (postId) {
        const post = await getPost(postId);
        if (post) {
            document.getElementById('post-title').value = post.title;
            document.getElementById('post-content').value = post.content;
        }
    }
    
    // Back button event
    document.getElementById('back-to-admin').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#/';
    });
    
    // Preview functionality
    const previewBtn = document.getElementById('preview-btn');
    const previewContainer = document.getElementById('preview-container');
    const contentTextarea = document.getElementById('post-content');
    
    previewBtn.addEventListener('click', () => {
        const content = contentTextarea.value;
        if (content.trim() === '') {
            previewContainer.innerHTML = '<p>내용을 입력하세요.</p>';
        } else {
            previewContainer.innerHTML = renderMarkdown(content);
        }
        
        previewContainer.style.display = previewContainer.style.display === 'none' ? 'block' : 'none';
        previewBtn.textContent = previewContainer.style.display === 'none' ? '미리보기' : '미리보기 닫기';
    });
    
    // Form submission
    const form = document.getElementById('editor-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        
        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }
        
        // Create or update post
        const post = {
            id: postId || Date.now().toString(),
            title: title,
            content: content,
            date: postId ? (await getPost(postId)).date : new Date().toISOString()
        };
        
        // Save the post
        await savePost(post);
        
        // Redirect to admin panel
        window.location.hash = '#/';
    });
}

// Initialize
window.addEventListener('hashchange', handleRoute);
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    handleRoute();
});