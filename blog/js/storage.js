// Storage functionality for blog posts
const STORAGE_KEY = 'blog_posts';

// Save a post to local storage
export async function savePost(post) {
    try {
        const posts = await getAllPosts();
        
        // Check if post already exists (for updating)
        const existingIndex = posts.findIndex(p => p.id === post.id);
        
        if (existingIndex >= 0) {
            // Update existing post
            posts[existingIndex] = post;
        } else {
            // Add new post
            posts.push(post);
        }
        
        // Save to local storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
        
        console.log('Post saved successfully:', post.id);
        return post;
    } catch (error) {
        console.error('Error saving post:', error);
        alert('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
        throw error;
    }
}

// Get all posts from local storage
export async function getAllPosts() {
    const postsJson = localStorage.getItem(STORAGE_KEY);
    
    if (!postsJson) {
        // Create sample post if no posts exist and this is the admin page
        if (localStorage.getItem('first_visit') !== 'false' && window.location.href.includes('/admin.html')) {
            const samplePost = createSamplePost();
            
            // Manually save to localStorage instead of using savePost to avoid alert
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify([samplePost]));
                localStorage.setItem('first_visit', 'false');
                console.log('Created sample post for first visit');
                return [samplePost];
            } catch (error) {
                console.error('Failed to create sample post:', error);
            }
        }
        return [];
    }
    
    try {
        return JSON.parse(postsJson);
    } catch (error) {
        console.error('Error parsing posts from localStorage:', error);
        return [];
    }
}

// Get a single post by ID
export async function getPost(id) {
    const posts = await getAllPosts();
    return posts.find(post => post.id === id);
}

// Delete a post by ID
export async function deletePost(id) {
    const posts = await getAllPosts();
    const updatedPosts = posts.filter(post => post.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
}

// Create a sample post for first-time visitors
function createSamplePost() {
    return {
        id: '1',
        title: '블로그 시작하기',
        content: `# 마크다운 블로그 시작하기

안녕하세요! 이 블로그는 마크다운으로 작성된 첫 번째 포스트입니다.

## 마크다운 사용법

마크다운은 텍스트 형식의 문서를 HTML로 변환해주는 가벼운 마크업 언어입니다. 다음과 같은 문법을 지원합니다:

### 제목

\`\`\`
# 제목 1
## 제목 2
### 제목 3
\`\`\`

### 강조

\`\`\`
**굵게** 또는 *기울임*
\`\`\`

### 목록

\`\`\`
- 항목 1
- 항목 2
  - 하위 항목
\`\`\`

### 링크 및 이미지

\`\`\`
[링크 텍스트](URL)
![이미지 설명](이미지 URL)
\`\`\`

### 코드

\`\`\`
인라인 코드는 \`코드\` 형식으로 작성합니다.

코드 블록은 다음과 같이 작성합니다:
\`\`\`
코드 내용
\`\`\`
\`\`\`

이 블로그에서 마음껏 마크다운을 활용해 보세요!`,
        date: new Date().toISOString()
    };
}