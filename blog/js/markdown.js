// Markdown processing with enhanced table support
export function renderMarkdown(text) {
    // Pre-process: Add trailing spaces to ensure line breaks work
    text = text.replace(/(?<!\n)\n(?!\n)/g, '  \n');
    
    // Using the marked library
    if (typeof marked !== 'undefined') {
        try {
            return marked.parse(text);
        } catch (e) {
            console.error('Error parsing markdown with marked:', e);
            return customMarkdownRender(text);
        }
    } else {
        console.error('Marked library not loaded');
        return customMarkdownRender(text);
    }
}

// Custom markdown renderer with reliable table support
function customMarkdownRender(text) {
    // Handle tables (must come before paragraph processing)
    text = processMarkdownTables(text);
    
    // Handle headers
    text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    text = text.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
    text = text.replace(/^##### (.*$)/gm, '<h5>$1</h5>');
    text = text.replace(/^###### (.*$)/gm, '<h6>$1</h6>');
    
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
    
    // Handle lists (unordered)
    text = text.replace(/^\s*[-*+]\s+(.*)/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>\n)+/g, '<ul>$&</ul>');
    
    // Handle lists (ordered)
    text = text.replace(/^\s*\d+\.\s+(.*)/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>\n)+/g, function(match) {
        if (match.includes('1. ')) {
            return '<ol>' + match + '</ol>';
        }
        return match;
    });
    
    // Handle blockquotes
    text = text.replace(/^\>(.*)/gm, '<blockquote>$1</blockquote>');
    
    // Handle horizontal rules
    text = text.replace(/^---$/gm, '<hr>');
    
    // Handle paragraphs and line breaks
    text = text.replace(/  \n/g, '<br>\n');
    text = text.replace(/\n\n/g, '</p><p>');
    
    // Wrap in paragraphs if not already
    if (!text.startsWith('<')) {
        text = '<p>' + text + '</p>';
    }
    
    return text;
}

// Process markdown tables specifically
function processMarkdownTables(text) {
    let lines = text.split('\n');
    let result = [];
    let tableStartIndex = -1;
    let tableLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        
        // If line starts and ends with pipe (|), it could be a table row
        if (line.startsWith('|') && line.endsWith('|')) {
            if (tableStartIndex === -1) {
                tableStartIndex = i;
            }
            tableLines.push(line);
        } 
        // If we were collecting table rows but this line isn't a table row
        else if (tableStartIndex !== -1) {
            let tableHtml = convertMarkdownTable(tableLines);
            result.push(tableHtml);
            tableStartIndex = -1;
            tableLines = [];
            result.push(line);
        } 
        // Not in a table
        else {
            result.push(line);
        }
    }
    
    // If we ended with a table
    if (tableStartIndex !== -1) {
        let tableHtml = convertMarkdownTable(tableLines);
        result.push(tableHtml);
    }
    
    return result.join('\n');
}

// Convert markdown table lines to HTML
function convertMarkdownTable(tableLines) {
    if (tableLines.length < 3) return tableLines.join('\n'); // Need header, separator, and at least one row
    
    const headerRow = tableLines[0];
    const separatorRow = tableLines[1];
    const bodyRows = tableLines.slice(2);
    
    // Check if this is really a table (has separator with dashes)
    if (!separatorRow.includes('-')) return tableLines.join('\n');
    
    // Extract alignments from separator row
    const alignments = parseAlignments(separatorRow);
    
    // Process header
    const headerCells = parseCells(headerRow);
    let html = '<table><thead><tr>';
    headerCells.forEach((cell, index) => {
        const align = alignments[index] || '';
        html += `<th${align ? ` style="text-align:${align}"` : ''}>${cell}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    // Process body rows
    bodyRows.forEach(row => {
        const cells = parseCells(row);
        html += '<tr>';
        cells.forEach((cell, index) => {
            const align = alignments[index] || '';
            html += `<td${align ? ` style="text-align:${align}"` : ''}>${cell}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    return html;
}

// Parse cells from a markdown table row
function parseCells(row) {
    return row.split('|')
        .filter((cell, index, array) => index > 0 && index < array.length) // Remove first and last empty cells
        .map(cell => cell.trim());
}

// Parse column alignments from a separator row
function parseAlignments(separatorRow) {
    return separatorRow.split('|')
        .filter((cell, index, array) => index > 0 && index < array.length) // Remove first and last empty cells
        .map(cell => {
            cell = cell.trim();
            if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
            if (cell.endsWith(':')) return 'right';
            return 'left';
        });
}