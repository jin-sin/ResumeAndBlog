# CORS Fix for Flask Server on Synology NAS

This document explains the changes made to fix CORS (Cross-Origin Resource Sharing) issues when running the Flask server on Synology NAS.

## Changes Made

### 1. Updated Flask Server CORS Configuration

We made the following changes to `app.py`:

- Disabled Flask-CORS to avoid conflicts with our custom implementation
- Created a custom middleware that explicitly sets CORS headers on every response
- Set `Access-Control-Allow-Origin: '*'` to allow requests from any origin
- Enhanced the OPTIONS request handler to return explicit CORS headers
- Added debug logging for CORS headers

### 2. Updated Frontend API Client 

In `api.js`, we made these changes:

- Updated API URL to use http protocol and the correct port (5501)
- Removed `credentials: 'include'` which is incompatible with `Access-Control-Allow-Origin: '*'`
- Added explicit `mode: 'cors'` to all fetch requests
- Enhanced error handling with CORS-specific debugging

### 3. Created Debugging Tools

- Added `cors-debug.html` - A standalone tool to test CORS configuration
- Updated `run_synology.sh` with additional debugging information
- Created comprehensive troubleshooting documentation

## How to Use

1. Run the server using the improved script:
   ```
   chmod +x run_synology.sh
   ./run_synology.sh
   ```

2. Test your CORS configuration using the debug tool:
   ```
   http://YOUR-SERVER-IP:5501/cors-debug.html
   ```

3. If issues persist, check the Flask server logs for errors and the specific response headers

## Technical Details

### Why `Access-Control-Allow-Origin: '*'` Instead of Specific Origins?

We chose to use the wildcard `*` for simplicity. A more secure approach would be to specify allowed origins:

```python
# Example of a more secure approach
origin = request.headers.get('Origin')
allowed_origins = ['http://orange-man.xyz', 'https://orange-man.xyz']
if origin in allowed_origins:
    response.headers['Access-Control-Allow-Origin'] = origin
```

### Why Remove `credentials: 'include'`?

When `Access-Control-Allow-Origin` is set to `*`, browsers will not allow requests with credentials. These two settings are incompatible by design as a security measure.

If you need to use credentials, you must:
1. Set specific origins instead of wildcard `*`
2. Enable `Access-Control-Allow-Credentials: true`
3. Set `credentials: 'include'` in fetch requests

## Further Resources

For more information about CORS:
- [MDN Web Docs: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Flask-CORS Documentation](https://flask-cors.readthedocs.io/)

For Synology-specific configuration:
- See our `CORS_TROUBLESHOOTING.md` document