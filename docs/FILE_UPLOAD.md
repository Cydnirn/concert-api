# File Upload Documentation

## Concert API - Image Upload

This API uses `@fastify/multipart` to handle file uploads for concert images.

## Endpoint

**POST** `/concert`

## Content-Type

`multipart/form-data`

## Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Name of the concert |
| details | string | Yes | Details about the concert |
| image | file | No | Image file (jpg, jpeg, png, gif) |

## File Constraints

- **Allowed file types**: JPG, JPEG, PNG, GIF
- **Maximum file size**: 10MB
- **Storage location**: `./uploads/` directory

## Example Usage

### Using cURL

```bash
curl -X POST http://localhost:3000/concert \
  -F "name=Summer Music Festival" \
  -F "details=Annual outdoor music festival" \
  -F "image=@/path/to/image.jpg"
```

### Using JavaScript Fetch API

```javascript
const formData = new FormData();
formData.append('name', 'Summer Music Festival');
formData.append('details', 'Annual outdoor music festival');
formData.append('image', fileInput.files[0]);

fetch('http://localhost:3000/concert', {
  method: 'POST',
  body: formData
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### Using Postman

1. Set request method to `POST`
2. Enter URL: `http://localhost:3000/concert`
3. Go to "Body" tab
4. Select "form-data"
5. Add key-value pairs:
   - `name`: Summer Music Festival
   - `details`: Annual outdoor music festival
   - `image`: (select file type and upload image)
6. Click "Send"

## Response

### Success (201 Created)

```json
{
  "id": 1,
  "name": "Summer Music Festival",
  "details": "Annual outdoor music festival",
  "image": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.jpg"
}
```

### Error Response

```json
{
  "status": 400,
  "error": "Only image files (jpg, jpeg, png, gif) are allowed!"
}
```

## Notes

- The uploaded image filename is randomly generated to prevent conflicts
- Original file extension is preserved
- Images are stored in the `./uploads/` directory
- If no image is uploaded, the `image` field will be `null`
- The endpoint validates file types based on MIME type

## Configuration

File upload settings can be modified in `src/main.ts`:

```typescript
app.register(fastifyMultipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});
```

Available limit options:
- `fieldNameSize`: Max field name size (default: 100 bytes)
- `fieldSize`: Max field value size (default: 1MB)
- `fields`: Max number of non-file fields (default: Infinity)
- `fileSize`: Max file size in bytes (default: Infinity)
- `files`: Max number of file fields (default: Infinity)
- `headerPairs`: Max number of header key-value pairs (default: 2000)