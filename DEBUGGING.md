# 🐛 Debugging Guide

This guide explains how to debug different parts of the application and where to find logs.

## 📍 Where to Find Logs

### 🖥️ **Server-Side Logs (API Routes)**
**Location**: Terminal where you run `npm run dev`

**What you'll see**:
- API request/response logs
- Database queries
- File upload operations
- Server errors
- Authentication checks

**Example**:
```
✓ Compiled /api/beats in 460ms
POST /api/beats 200 in 1075ms
GET /api/beats 200 in 123ms
Supabase upload failed, falling back to local storage: Error [StorageApiError]
PUT /api/beats/7 500 in 8426ms
```

### 🌐 **Client-Side Logs (Frontend)**
**Location**: Browser Developer Console (F12 → Console tab)

**What you'll see**:
- React component logs
- User interactions
- Form validation
- Client-side errors
- Wizard step transitions

**Example**:
```
🎵 BeatWizard: Initializing with mode: edit
🎵 UploadFilesStep: Current beat data: {...}
🎵 submitSingleBeat: Adding WAV file: song.wav
```

## 🔍 Debugging Different Components

### **API Routes Debugging**

#### Beat Management APIs
- **GET** `/api/beats` - Fetch all beats
- **POST** `/api/beats` - Create new beat
- **PUT** `/api/beats/[id]` - Update existing beat
- **DELETE** `/api/beats/[id]` - Delete beat

**Common Issues**:
- **401 Unauthorized**: User not logged in or not admin
- **400 Bad Request**: Missing required fields
- **500 Internal Server Error**: Database or file upload issues

#### File Upload APIs
- **File Size Issues**: Check terminal for "exceeds Supabase limit" messages
- **Directory Issues**: Look for "ENOENT: no such file or directory" errors
- **Storage Issues**: Check Supabase configuration and fallback to local storage

### **Wizard System Debugging**

#### Step-by-Step Logging
Each wizard step logs its current state:

```javascript
// Upload Files Step
🎵 UploadFilesStep: Current beat data: {...}
🎵 UploadFilesStep: Beat existingFiles: {...}
🎵 UploadFilesStep: getFileDisplayName(mp3): {...}

// API Submission
🎵 submitSingleBeat: Starting submission for beat: {...}
🎵 submitSingleBeat: Adding WAV file: song.wav
🎵 submitSingleBeat: Making request to: /api/beats/7 with method: PUT
🎵 submitSingleBeat: Success response: { success: true }
```

#### Common Wizard Issues
- **File not showing**: Check `existingFiles` property in logs
- **Validation errors**: Look for "Validation failed" messages
- **API submission fails**: Check network tab and terminal logs

### **Database Debugging**

#### Connection Issues
- Check `.env.local` for `SUPABASE_DATABASE_URL`
- Verify database is accessible
- Check for migration issues

#### Query Issues
- Look for SQL errors in terminal
- Check if tables exist
- Verify column names match schema

### **File Storage Debugging**

#### Supabase Storage
- **Configuration**: Check environment variables
- **Size Limits**: 50MB per file
- **Bucket Access**: Verify bucket permissions

#### Local Storage Fallback
- **Directory Creation**: Check if `uploads/` directories exist
- **File Permissions**: Ensure write permissions
- **File Serving**: Check `/api/files/[...path]` route

## 🛠️ Debugging Tools

### **Browser Developer Tools**
1. **Console Tab**: Client-side logs and errors
2. **Network Tab**: API requests and responses
3. **Application Tab**: Local storage, session storage
4. **Sources Tab**: Breakpoints and debugging

### **Terminal Commands**
```bash
# Check if API is running
curl -s 'http://localhost:3002/api/beats' | head -c 100

# Check file uploads directory
ls -la uploads/

# Check database connection
npm run db:studio
```

### **Environment Variables**
Check these in `.env.local`:
```env
SUPABASE_DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## 🚨 Common Error Patterns

### **File Upload Errors**
```
Error: ENOENT: no such file or directory
→ Directory doesn't exist, check ensureDirectoryExists()

Error [StorageApiError]: The object exceeded the maximum allowed size
→ File too large for Supabase, using local storage fallback

Error [StorageApiError]: The resource already exists
→ File name conflict, check unique filename generation
```

### **API Errors**
```
PUT /api/beats/7 500 in 8426ms
→ Check terminal for detailed error message

401 Unauthorized
→ User not logged in or not admin

400 Bad Request
→ Missing required fields in request body
```

### **Wizard Errors**
```
Validation failed: ["Title is required"]
→ Check form validation in ReviewStep

Failed to save: Upload failed: Error: ENOENT
→ Check file upload and directory creation
```

## 📊 Performance Monitoring

### **API Response Times**
- **Fast**: < 200ms
- **Normal**: 200-1000ms  
- **Slow**: > 1000ms (check database queries)

### **File Upload Times**
- **Small files**: < 1s
- **Large files**: 1-10s (depending on size)
- **Very large files**: May timeout (check size limits)

## 🔧 Quick Fixes

### **Reset Upload Directories**
```bash
rm -rf uploads/
mkdir -p uploads/audio uploads/images
```

### **Clear Browser Cache**
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear storage in DevTools → Application tab

### **Restart Development Server**
```bash
# Stop server (Ctrl+C)
# Then restart
npm run dev
```

## 📝 Logging Best Practices

### **Server-Side Logging**
- Use descriptive prefixes: `🎵`, `🔍`, `❌`
- Include context: component name, function name
- Log both success and error cases
- Include relevant data (without sensitive info)

### **Client-Side Logging**
- Use consistent emoji prefixes
- Log state changes and user interactions
- Include debugging data for complex operations
- Use different log levels: `console.log`, `console.error`, `console.warn`

## 🆘 Getting Help

When reporting issues, include:
1. **Terminal logs** (server-side errors)
2. **Browser console logs** (client-side errors)
3. **Steps to reproduce**
4. **Expected vs actual behavior**
5. **File sizes** (for upload issues)
6. **Browser and OS information**

---

**Remember**: Server logs are in the terminal, client logs are in the browser console! 🎯
