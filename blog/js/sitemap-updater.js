// Automatic sitemap updater for the blog
import { fetchAllPosts, fetchSitemap } from './api.js';

// Base domain for the sitemap
const BASE_URL = 'https://orange-man.xyz';

// Function to update the sitemap.xml file
export async function updateSitemapXML() {
    try {
        console.log('Updating sitemap.xml...');
        
        // Get sitemap content directly from the API
        const sitemapContent = await fetchSitemap();
        console.log('Received sitemap content from API');
        
        // Update the sitemap.xml file on the server
        const success = await uploadSitemapToServer(sitemapContent);
        
        if (success) {
            console.log('sitemap.xml updated successfully');
            showSuccessNotification();
            return true;
        } else {
            console.log('Could not automatically update sitemap.xml, providing download option');
            downloadSitemap(sitemapContent);
            showDownloadNotification();
            return false;
        }
    } catch (error) {
        console.error('Error updating sitemap:', error);
        
        // Fallback: generate sitemap locally if API fails
        try {
            console.log('Attempting to generate sitemap locally...');
            const posts = await fetchAllPosts();
            const sitemapContent = generateSitemapContent(posts);
            downloadSitemap(sitemapContent);
            showDownloadNotification();
            return false;
        } catch (fallbackError) {
            console.error('Fallback generation failed:', fallbackError);
            return false;
        }
    }
}

// Try to upload the sitemap directly to the server
async function uploadSitemapToServer(content) {
    try {
        // Get authentication from the auth module (must be admin)
        const sitemapToken = localStorage.getItem('sitemap_token') || 'YOUR_SECRET_TOKEN';
        
        // Make a POST request to a server-side script that updates the sitemap
        const response = await fetch('/update-sitemap.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
                'Authorization': `Bearer ${sitemapToken}`
            },
            body: content
        });
        
        if (response.ok) {
            // Try to parse response for additional info
            try {
                const result = await response.json();
                console.log('Sitemap update result:', result);
            } catch (e) {
                // Ignore parsing errors
            }
            return true;
        } else {
            console.warn('Server returned error when updating sitemap:', response.status);
            try {
                const errorData = await response.json();
                console.warn('Error details:', errorData);
            } catch (e) {
                // Ignore parsing errors
            }
            return false;
        }
    } catch (error) {
        console.error('Error uploading sitemap to server:', error);
        return false;
    }
}

// Generate sitemap XML content (fallback method)
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

// Download sitemap file as fallback
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

// Notification when sitemap is automatically updated
function showSuccessNotification() {
    showNotification(
        'sitemap.xml이 자동으로 업데이트 되었습니다',
        '검색 엔진은 다음 크롤링 시 새로운 콘텐츠를 색인화할 것입니다.',
        '#3DDC84'
    );
}

// Notification when sitemap needs manual upload
function showDownloadNotification() {
    showNotification(
        'sitemap.xml이 다운로드 되었습니다',
        '이 파일을 웹사이트 루트 디렉토리에 업로드하여 검색 엔진 색인을 업데이트하세요.',
        '#FF9800'
    );
}

// Generic notification function
function showNotification(title, message, color) {
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
        background-color: ${color};
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        font-size: 14px;
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <p><strong>${title}</strong></p>
        <p style="margin-top: 5px;">${message}</p>
    `;
    
    document.body.appendChild(notification);
    
    // Record that we showed notification
    localStorage.setItem('sitemap_notification_time', now.toString());
    
    // Remove notification after 8 seconds
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 8000);
}