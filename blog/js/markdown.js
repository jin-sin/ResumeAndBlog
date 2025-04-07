// Markdown processing
export function renderMarkdown(text) {
    // Using the marked library
    if (typeof marked !== 'undefined') {
        // Configure marked options if needed
        marked.setOptions({
            breaks: true,       // Add line breaks
            gfm: true,          // GitHub Flavored Markdown
            headerIds: true,    // Add IDs to headers
            sanitize: false     // Allow HTML
        });
        
        return marked.parse(text);
    } else {
        console.error('Marked library not loaded');
        return convertMarkdownFallback(text);
    }
}

// Fallback basic markdown parser if marked isn't available
function convertMarkdownFallback(text) {
    // Handle headers
    text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    
    // Handle bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Handle links
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    
    // Handle code blocks
    text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Handle inline code
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Handle images
    text = text.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">');
    
    // Handle paragraphs (basic)
    text = text.replace(/\n\n/g, '</p><p>');
    text = '<p>' + text + '</p>';
    
    return text;
}