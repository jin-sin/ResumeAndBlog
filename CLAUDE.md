# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Run locally: Open `resume.html` or `blog/index.html` in a web browser
- Deploy: Copy all files to a web hosting service
- Validate HTML: Use W3C Validator (https://validator.w3.org)

## Code Style Guidelines
- HTML: Use HTML5 semantic elements
- CSS: Keep styles in the `<style>` section of HTML files
- JavaScript: Use ES6+ syntax with modules
- Indentation: 4 spaces 
- File structure: Keep assets in the `asset/` directory
- Naming: Use kebab-case for filenames, camelCase for JavaScript variables
- Images: Optimize for web (webp preferred, PNG/JPG when necessary)
- Firebase: Keep sensitive keys in environment variables (not in code)
- Blog posts: Use markdown for content

## Security Guidelines
- Never commit auth-config.js to version control
- Keep admin URL private and secure
- Use password hashing for authentication
- Add new files to appropriate directories following existing structure