// Tool to migrate posts from localStorage to MariaDB
import { getAllPosts } from './storage.js';
import { createPost } from './api.js';

// Export all posts from localStorage to a JSON file
export async function exportPostsToJson() {
    try {
        // Get all posts from localStorage
        const posts = await getAllPosts();
        
        if (!posts || posts.length === 0) {
            alert('내보낼 게시물이 없습니다.');
            return null;
        }
        
        // Convert to JSON string
        const jsonString = JSON.stringify(posts, null, 2);
        
        // Create a downloadable file
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'blog_posts.json';
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        return posts.length;
    } catch (error) {
        console.error('Error exporting posts:', error);
        alert('게시물 내보내기 중 오류가 발생했습니다.');
        return null;
    }
}

// Migrate posts directly from localStorage to MariaDB
export async function migratePostsToDb() {
    try {
        // Get all posts from localStorage
        const posts = await getAllPosts();
        
        if (!posts || posts.length === 0) {
            alert('마이그레이션할 게시물이 없습니다.');
            return false;
        }
        
        // Show confirmation
        if (!confirm(`총 ${posts.length}개의 게시물을 MariaDB로 마이그레이션하시겠습니까?`)) {
            return false;
        }
        
        // Track success/failure
        let successCount = 0;
        let failureCount = 0;
        
        // Migrate each post
        for (const post of posts) {
            try {
                await createPost(post);
                successCount++;
                console.log(`Post migrated: ${post.id}`);
            } catch (error) {
                failureCount++;
                console.error(`Failed to migrate post ${post.id}:`, error);
            }
        }
        
        // Show results
        alert(`마이그레이션 완료: ${successCount}개 성공, ${failureCount}개 실패`);
        return successCount > 0;
    } catch (error) {
        console.error('Migration error:', error);
        alert('마이그레이션 중 오류가 발생했습니다.');
        return false;
    }
}