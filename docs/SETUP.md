# Setup Instructions for File Upload Feature

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Running PostgreSQL database (for TypeORM)

## Installation

### 1. Install Required Package

The Fastify multipart plugin needs to be installed:

```bash
npm install @fastify/multipart
```

Or with yarn:

```bash
yarn add @fastify/multipart
```

### 2. Database Migration

The Concert entity has been updated with an `image` column. You need to synchronize your database:

**Option A: Auto Synchronization (Development)**

If you have `synchronize: true` in your TypeORM configuration, the database will update automatically when you restart the application.

**Option B: Manual Migration (Production)**

Run a migration to add the image column:

```sql
ALTER TABLE concert ADD COLUMN image VARCHAR(255) NULL;
```

### 3. Create Uploads Directory

The application stores uploaded files in the `./uploads` directory:

```bash
mkdir -p uploads
```

This directory is automatically created by the application if it doesn't exist, but it's good practice to create it beforehand.

### 4. Configure File Upload Limits

File upload settings are configured in `src/main.ts`. Default settings:

- **Max file size**: 10MB
- **Allowed types**: JPG, JPEG, PNG, GIF

To modify these settings, edit `src/main.ts`:

```typescript
app.register(fastifyMultipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // Change this value
    files: 1, // Maximum number of files
    fields: 10, // Maximum number of fields
  },
});
```

### 5. Environment Configuration

Ensure your environment variables are properly set. Check your `.env` file:

```env
NODE_ENV=development
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password
DATABASE_NAME=your_database
FILE_DIRECTORY=/your/directory
```

## Running the Application

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## Testing the Upload Feature

### Method 1: Using the HTML Test Page

1. Open `docs/test-upload.html` in your browser
2. Fill in the form fields
3. Select an image file
4. Click "Create Concert"

### Method 2: Using cURL

```bash
curl -X POST http://localhost:3000/concert \
  -F "name=Summer Music Festival" \
  -F "details=Annual outdoor music festival" \
  -F "image=@/path/to/your/image.jpg"
```

### Method 3: Using Postman

1. Create a new POST request to `http://localhost:3000/concert`
2. Select "Body" tab → "form-data"
3. Add fields:
   - `name`: (text)
   - `details`: (text)
   - `image`: (file)
4. Send the request

## Verify Installation

To verify everything is working correctly:

1. **Check the server logs** - Look for successful plugin registration:
   ```
   [Fastify] Server listening at http://0.0.0.0:3000
   ```

2. **Test file upload** - Use any of the testing methods above

3. **Check uploads directory** - After a successful upload, verify that:
   - The FILE_DIRECTORY from env contains the uploaded file
   - The filename is a random hash with the original extension
   - The database record contains the filename in the `image` column

## Troubleshooting

### Issue: "Cannot find module '@fastify/multipart'"

**Solution**: Install the package:
```bash
npm install @fastify/multipart
```

### Issue: "ENOENT: no such file or directory, open './uploads/...'"

**Solution**: The uploads directory doesn't exist. Create it:
```bash
mkdir -p /your/directory
```

### Issue: "File size limit exceeded"

**Solution**: Increase the file size limit in `src/main.ts`:
```typescript
app.register(fastifyMultipart, {
  limits: {
    fileSize: 20 * 1024 * 1024, // Increase to 20MB
  },
});
```

### Issue: "Only image files are allowed"

**Solution**: Check that:
- The file has a valid image extension (.jpg, .jpeg, .png, .gif)
- The MIME type is correct
- If you need to support additional formats, update the validation in `src/concert/concert.controller.ts`

### Issue: Database column error

**Solution**: Ensure the `image` column exists in the database:
```sql
-- Check if column exists
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'concert' AND column_name = 'image';

-- If not, add it
ALTER TABLE concert ADD COLUMN image VARCHAR(255) NULL;
```

## Security Considerations

1. **File Size Limits**: Always set reasonable file size limits to prevent DoS attacks
2. **File Type Validation**: Only allow specific file types (currently: images only)
3. **Filename Sanitization**: Files are automatically renamed with random hashes
4. **Storage Location**: Files are stored outside the web root by default
5. **Upload Directory**: Add `/uploads` to `.gitignore` to prevent committing uploaded files

## Production Deployment

For production environments:

1. **Use external storage**: Consider using S3, Google Cloud Storage, or similar services instead of local storage
2. **Set strict limits**: Configure appropriate file size and count limits
3. **Enable HTTPS**: Always use HTTPS in production
4. **Add virus scanning**: Implement antivirus scanning for uploaded files
5. **Backup uploads**: Ensure the uploads directory is included in your backup strategy

## Additional Resources

- [@fastify/multipart Documentation](https://github.com/fastify/fastify-multipart)
- [NestJS with Fastify](https://docs.nestjs.com/techniques/performance)
- [TypeORM Documentation](https://typeorm.io/)

## Support

For issues or questions, refer to:
- `docs/FILE_UPLOAD.md` - API usage documentation
- `docs/test-upload.html` - Interactive testing tool
