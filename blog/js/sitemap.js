// Sitemap generator for blog posts
import { getAllPosts } from './storage.js';

// Constants
const SITE_URL = window.location.origin; // Base URL of the site
const SITEMAP_PATH = '/sitemap.xml'; // Path where sitemap will be saved

// Generate sitemap XML
async function generateSitemapXML() {
    try {
        // Get all posts
        const posts = await getAllPosts();
        
        // Start XML content
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        
        // Add homepage
        xml += '  <url>\n';
        xml += `    <loc>${SITE_URL}/resume.html</loc>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>1.0</priority>\n';
        xml += '  </url>\n';
        
        // Add blog homepage
        xml += '  <url>\n';
        xml += `    <loc>${SITE_URL}/blog/index.html</loc>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.9</priority>\n';
        xml += '  </url>\n';
        
        // Add each blog post
        posts.forEach(post => {
            const postUrl = `${SITE_URL}/blog/index.html#/post/${post.id}`;
            const lastmod = new Date(post.date).toISOString().split('T')[0]; // Format: YYYY-MM-DD
            
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
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return null;
    }
}

// Function to download the sitemap
export async function downloadSitemap() {
    const sitemapXML = await generateSitemapXML();
    
    if (sitemapXML) {
        // Create blob and download link
        const blob = new Blob([sitemapXML], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sitemap.xml';
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
}

// Function to update sitemap
export async function updateSitemap() {
    try {
        const sitemapXML = await generateSitemapXML();
        if (!sitemapXML) return false;
        
        // In a real server environment, we would write to the file system
        // Since we can't do that in the browser, we'll save to localStorage
        localStorage.setItem('sitemap_content', sitemapXML);
        localStorage.setItem('sitemap_updated', new Date().toISOString());
        
        console.log('Sitemap updated successfully');
        return true;
    } catch (error) {
        console.error('Error updating sitemap:', error);
        return false;
    }
}

// Function to get the stored sitemap content
export function getSitemapContent() {
    return localStorage.getItem('sitemap_content') || generateDefaultSitemap();
}

// Generate a default sitemap if none exists
function generateDefaultSitemap() {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}/resume.html</loc>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>1.0</priority>\n';
    xml += '  </url>\n';
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}/blog/index.html</loc>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.9</priority>\n';
    xml += '  </url>\n';
    xml += '</urlset>';
    
    return xml;
}