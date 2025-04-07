// Markdown processing
export function renderMarkdown(text) {
    // Fix: Ensure newlines are respected by explicitly converting them to <br> tags
    // This handles the common case where entered newlines should create visual breaks
    text = text.replace(/(?<!\n)\n(?!\n)/g, '  \n');
    
    // Using the marked library
    if (typeof marked !== 'undefined') {
        // The marked library is already configured in the HTML
        // with the necessary options for tables and line breaks
        try {
            return marked.parse(text);
        } catch (e) {
            console.error('Error parsing markdown:', e);
            return convertMarkdownFallback(text);
        }
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
    
    // Very basic table support (doesn't handle all table formats)
    text = text.replace(/^\|(.*)\|$/gm, function(match, content) {
        const cells = content.split('|').map(cell => cell.trim());
        const isHeaderRow = cells.some(cell => cell.match(/^-+$/));
        
        if (isHeaderRow) {
            return ''; // Skip header separator row
        }
        
        const cellTag = match.match(/^\|[-:\s|]+\|$/) ? 'th' : 'td';
        const cellsHtml = cells.map(cell => `<${cellTag}>${cell}</${cellTag}>`).join('');
        
        return `<tr>${cellsHtml}</tr>`;
    });
    
    // Wrap table rows with table tags
    text = text.replace(/(<tr>.*<\/tr>\n)+/g, function(match) {
        return `<table>${match}</table>`;
    });
    
    // Handle line breaks with two spaces at end of line OR <br> tags
    text = text.replace(/  \n/g, '<br>\n');
    
    // Handle paragraphs (double newlines)
    text = text.replace(/\n\n/g, '</p><p>');
    text = '<p>' + text + '</p>';
    
    return text;
}