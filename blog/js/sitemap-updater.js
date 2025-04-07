// Sitemap updater with manual download fallback
import { getAllPosts } from './storage.js';

// Base domain for the sitemap
const BASE_URL = 'https://orange-man.xyz';

// Function to update or download the sitemap
export async function updateSitemapXML() {
    try {
        // Get all posts for the sitemap
        const posts = await getAllPosts();
        
        // Generate new sitemap XML content
        const sitemapContent = generateSitemapContent(posts);
        
        // Browsers can't directly modify files on the server
        // So we'll prompt the user to download the updated sitemap
        downloadSitemap(sitemapContent);
        
        // Let the user know what's happening
        showUpdateNotification();
        
        return true;
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return false;
    }
}

// Generate sitemap XML content
function generateSitemapContent(posts) {
    // Start XML content
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add homepage
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/resume.html</loc>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>1.0</priority>\n';
    xml += '  </url>\n';
    
    // Add blog homepage
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/blog/index.html</loc>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.9</priority>\n';
    xml += '  </url>\n';
    
    // Add blog posts
    posts.forEach(post => {
        const postUrl = `${BASE_URL}/blog/index.html#/post/${post.id}`;
        const lastmod = new Date(post.date).toISOString().split('T')[0]; // YYYY-MM-DD format
        
        xml += '  <url>\n';
        xml += `    <loc>${postUrl}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
    });
    
    // Close XML
    xml += '</urlset>';
    
    return xml;
}

// Download sitemap file
function downloadSitemap(content) {
    // Create a blob with the sitemap content
    const blob = new Blob([content], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    
    // Trigger the download
    a.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// Display notification about manual sitemap update
function showUpdateNotification() {
    // Check if notification already shown recently (avoid spamming)
    const lastNotified = localStorage.getItem('sitemap_notification_time');
    const now = Date.now();
    
    // If we've shown notification in the last hour, don't show again
    if (lastNotified && (now - parseInt(lastNotified)) < 3600000) {
        return;
    }
    
    // Show a small notification that doesn't interrupt workflow
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #3DDC84;
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        font-size: 14px;
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <p><strong>sitemap.xml이 다운로드 되었습니다</strong></p>
        <p style="margin-top: 5px;">이 파일을 웹사이트 루트 디렉토리에 업로드하여 검색 엔진 색인을 업데이트하세요.</p>
    `;
    
    document.body.appendChild(notification);
    
    // Record that we showed notification
    localStorage.setItem('sitemap_notification_time', now.toString());
    
    // Remove notification after 8 seconds
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 8000);
}