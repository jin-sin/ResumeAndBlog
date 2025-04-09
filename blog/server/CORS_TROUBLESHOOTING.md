# CORS Troubleshooting Guide

This guide will help you resolve Cross-Origin Resource Sharing (CORS) issues when running the Flask server on Synology NAS.

## Common CORS Issues

CORS errors occur when a web page from one domain (e.g., your blog) tries to access resources on another domain (e.g., your Flask API) without proper permissions.

### Typical Error Messages

In your browser console, you might see errors like:

```
Access to fetch at 'http://orange-man.xyz:5501/api/posts' from origin 'http://your-blog-domain.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Checklist for Fixing CORS Issues

1. **Verify Flask Server Configuration**
    - Make sure the Flask server has CORS enabled with proper configuration
    - Check that the server is running and accessible from the network

2. **API Base URL**
    - Ensure your frontend's `API_BASE_URL` in `api.js` is correct
    - Use the full domain name or IP address of your Synology NAS
    - Make sure the port number is correct (default: 5000)

3. **Synology Firewall**
    - Check if the Synology firewall is blocking port 5000
    - Go to Control Panel > Security > Firewall
    - Add a rule to allow port 5000 traffic

4. **Reverse Proxy Setup**
    - Consider setting up a reverse proxy on Synology DSM:
        - Go to Control Panel > Application Portal > Reverse Proxy
        - Create a new rule that forwards traffic from a subdomain (e.g., api.yourdomain.com) to the Flask server (localhost:5000)

5. **Docker Configuration (if using Docker)**
    - If running in Docker, ensure port 5000 is properly exposed
    - Map the container port to a host port: `-p 5000:5000`

## Running the Flask Server

Use the provided `run_synology.sh` script to start the server:

```bash
chmod +x run_synology.sh
./run_synology.sh
```

## Testing CORS Configuration

You can test your CORS configuration with this command:

```bash
curl -X OPTIONS https://192.168.0.59:5501/api/posts -H "Origin: https://orange-man.xzy" -H "Access-Control-Request-Method: GET" -v
```

You should see the CORS headers in the response.

## Debugging CORS Issues

1. **Server Logs**
    - Check Flask server logs for error messages
    - Watch the console when accessing the API

2. **Network Monitoring**
    - Use browser developer tools (F12) > Network tab
    - Look for failed requests and examine response headers

3. **Test with Simpler Requests**
    - Try accessing your API with a simple tool like curl
    - Test with a minimal HTML+JS example to isolate the issue

## Advanced Solutions

1. **Configure Flask-CORS with specific origins**:
   ```python
   CORS(app, resources={r"/api/*": {"origins": ["http://orange-man.xyz", "https://orange-man.xyz"]}})
   ```

2. **Disable credentials if not needed**:
   ```python
   CORS(app, resources={r"/api/*": {"origins": "*", "supports_credentials": False}})
   ```

3. **Set up a dedicated API subdomain** - This can help avoid CORS issues entirely.
