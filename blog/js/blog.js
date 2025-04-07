// Main blog functionality
import { renderMarkdown } from './markdown.js';
import { savePost, getAllPosts, getPost } from './storage.js';

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
    } else if (hash === '#/new') {
        showEditor();
    } else if (hash.startsWith('#/post/')) {
        const postId = hash.replace('#/post/', '');
        showPost(postId);
    }
}

// Show list of blog posts
async function showBlogList() {
    // Add new post button
    const newPostBtn = document.createElement('a');
    newPostBtn.href = '#/new';
    newPostBtn.className = 'new-post-btn';
    newPostBtn.textContent = '새 글 작성';
    mainContent.appendChild(newPostBtn);
    
    // Create blog list container
    const blogListElement = document.createElement('div');
    blogListElement.className = 'blog-list';
    mainContent.appendChild(blogListElement);
    
    // Get all posts and display them
    const posts = await getAllPosts();
    
    if (posts.length === 0) {
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
}

// Show individual blog post
async function showPost(postId) {
    const post = await getPost(postId);
    
    if (!post) {
        mainContent.innerHTML = '<p>글을 찾을 수 없습니다.</p>';
        return;
    }
    
    const backButton = document.createElement('a');
    backButton.href = '#/';
    backButton.className = 'back-button';
    backButton.textContent = '← 목록으로';
    mainContent.appendChild(backButton);
    
    const postElement = document.createElement('article');
    postElement.className = 'blog-post';
    
    const headerElement = document.createElement('header');
    headerElement.className = 'post-header';
    headerElement.innerHTML = `
        <h1 class="post-title">${post.title}</h1>
        <div class="post-date">${new Date(post.date).toLocaleDateString()}</div>
    `;
    
    const contentElement = document.createElement('div');
    contentElement.className = 'post-content';
    contentElement.innerHTML = renderMarkdown(post.content);
    
    postElement.appendChild(headerElement);
    postElement.appendChild(contentElement);
    mainContent.appendChild(postElement);
}

// Show post editor
function showEditor() {
    const backButton = document.createElement('a');
    backButton.href = '#/';
    backButton.className = 'back-button';
    backButton.textContent = '← 취소';
    mainContent.appendChild(backButton);
    
    const editorContainer = document.createElement('div');
    editorContainer.className = 'editor-container';
    
    const form = document.createElement('form');
    form.className = 'editor-form';
    form.innerHTML = `
        <label for="post-title">제목</label>
        <input type="text" id="post-title" name="title" required>
        
        <label for="post-content">내용 (마크다운 형식)</label>
        <textarea id="post-content" name="content" required></textarea>
        
        <div id="preview-container" class="preview-container" style="display: none;"></div>
        
        <div class="buttons-container">
            <button type="submit" class="submit-btn">저장</button>
            <button type="button" class="preview-btn" id="preview-btn">미리보기</button>
        </div>
    `;
    
    editorContainer.appendChild(form);
    mainContent.appendChild(editorContainer);
    
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
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        
        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }
        
        // Create new post object
        const post = {
            id: Date.now().toString(),
            title: title,
            content: content,
            date: new Date().toISOString()
        };
        
        // Save the post
        await savePost(post);
        
        // Redirect to post view
        window.location.hash = `#/post/${post.id}`;
    });
}

// Initialize
window.addEventListener('hashchange', handleRoute);
document.addEventListener('DOMContentLoaded', handleRoute);