# Testing Documentation

## Overview

This document describes the testing strategy and implementation for the Concert API. The tests use Jest as the testing framework with mocking to isolate units of code.

## Test Structure

The project follows NestJS testing conventions with the following structure:

```
src/
├── concert/
│   ├── concert.controller.spec.ts    # Controller unit tests
│   ├── concert.service.spec.ts       # Service unit tests
│   ├── concert.controller.ts
│   ├── concert.service.ts
│   └── concert.entity.ts
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:cov
```

### Run Specific Test File

```bash
npm test -- concert.controller.spec
```

### Run Tests in Debug Mode

```bash
npm run test:debug
```

## Test Coverage

The test suite covers:

### Controller Tests (`concert.controller.spec.ts`)

1. **GET /concert** - Retrieve all concerts
   - ✅ Returns array of concerts
   - ✅ Returns empty array when no concerts exist
   - ✅ Handles service errors with proper HttpException

2. **GET /concert/:id** - Retrieve single concert
   - ✅ Returns concert by ID
   - ✅ Throws HttpException when not found

3. **POST /concert** - Create concert with file upload
   - ✅ Creates concert with image upload
   - ✅ Creates concert without image
   - ✅ Validates multipart request format
   - ✅ Validates file type (only images allowed)
   - ✅ Creates upload directory if not exists
   - ✅ Uses ConfigService for upload path
   - ✅ Falls back to default path when config not set

4. **PUT /concert/:id** - Update concert
   - ✅ Updates concert with full data
   - ✅ Updates concert with partial data
   - ✅ Throws HttpException when not found

5. **DELETE /concert/:id** - Delete concert
   - ✅ Deletes concert successfully
   - ✅ Throws HttpException when not found
   - ✅ Returns void on success

6. **Error Handling**
   - ✅ Wraps service errors in HttpException
   - ✅ Returns BAD_REQUEST status code

### Service Tests (`concert.service.spec.ts`)

1. **create()** - Create new concert
   - ✅ Creates concert without image
   - ✅ Creates concert with image
   - ✅ Handles save errors

2. **find()** - Retrieve all concerts
   - ✅ Returns array of concerts
   - ✅ Returns empty array when none exist
   - ✅ Handles database errors

3. **findOne()** - Retrieve single concert
   - ✅ Returns concert by ID
   - ✅ Throws NotFoundException when not found
   - ✅ Handles database errors

4. **update()** - Update concert
   - ✅ Updates all fields
   - ✅ Updates partial fields
   - ✅ Updates image field
   - ✅ Throws NotFoundException when not found
   - ✅ Handles save errors

5. **delete()** - Delete concert
   - ✅ Deletes concert successfully
   - ✅ Throws NotFoundException when not found
   - ✅ Handles database errors

6. **Edge Cases**
   - ✅ Handles empty update DTO
   - ✅ Handles null image filename
   - ✅ Handles very long names
   - ✅ Handles special characters

## Mocking Strategy

### Controller Tests

The controller tests mock:

1. **ConcertService** - All service methods are mocked
2. **ConfigService** - Configuration retrieval is mocked
3. **File System (fs)** - File operations are mocked
4. **Path module** - Path operations are mocked
5. **FastifyRequest** - Multipart request handling is mocked

Example mock setup:

```typescript
const mockConcertService = {
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};
```

### Service Tests

The service tests mock:

1. **TypeORM Repository** - Database operations are mocked using `getRepositoryToken()`

Example mock setup:

```typescript
const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
};
```

## Mock Data

Standard mock data used across tests:

```typescript
const mockConcert: Concert = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Summer Music Festival',
  organizer: 'Music Events Inc',
  details: 'Annual outdoor music festival',
  image: 'test-image.jpg',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};
```

## Testing File Uploads

File upload testing uses mock streams:

```typescript
const mockFileStream = new Readable();
mockFileStream.push('fake-image-data');
mockFileStream.push(null);

const mockRequest = {
  isMultipart: jest.fn().mockReturnValue(true),
  parts: jest.fn().mockReturnValue({
    async *[Symbol.asyncIterator]() {
      yield {
        type: 'file',
        fieldname: 'image',
        filename: 'test.jpg',
        mimetype: 'image/jpeg',
        file: mockFileStream,
      };
    },
  }),
} as any;
```

## Best Practices

### 1. Arrange-Act-Assert Pattern

All tests follow the AAA pattern:

```typescript
it('should return a concert by id', async () => {
  // Arrange
  const id = '123e4567-e89b-12d3-a456-426614174000';
  mockConcertService.findOne.mockResolvedValue(mockConcert);

  // Act
  const result = await controller.getConcertById(id);

  // Assert
  expect(result).toBeDefined();
  expect(result.id).toBe(mockConcert.id);
  expect(service.findOne).toHaveBeenCalledWith(id);
});
```

### 2. Clear Mocks Between Tests

```typescript
beforeEach(async () => {
  // ... module setup
  jest.clearAllMocks();
});
```

### 3. Test Both Success and Failure Cases

```typescript
it('should return concerts', async () => {
  // Test success case
});

it('should throw error when database fails', async () => {
  // Test failure case
});
```

### 4. Verify Mock Calls

```typescript
expect(service.find).toHaveBeenCalledTimes(1);
expect(service.findOne).toHaveBeenCalledWith(id);
```

### 5. Test Edge Cases

- Empty data
- Null values
- Very long strings
- Special characters
- Missing required fields

## Common Testing Patterns

### Testing Async Operations

```typescript
it('should handle async operations', async () => {
  mockService.method.mockResolvedValue(expectedResult);
  
  const result = await controller.method();
  
  expect(result).toEqual(expectedResult);
});
```

### Testing Exceptions

```typescript
it('should throw exception', async () => {
  mockService.method.mockRejectedValue(new Error('Error message'));
  
  await expect(controller.method()).rejects.toThrow(HttpException);
  await expect(controller.method()).rejects.toThrow(
    expect.objectContaining({
      response: expect.objectContaining({
        status: HttpStatus.BAD_REQUEST,
        error: 'Error message',
      }),
    }),
  );
});
```

### Testing with Mock Data

```typescript
it('should process data correctly', async () => {
  const input = { name: 'Test' };
  const output = { id: '1', ...input };
  
  mockRepository.create.mockReturnValue(output);
  mockRepository.save.mockResolvedValue(output);
  
  const result = await service.create(input);
  
  expect(result).toEqual(output);
});
```

## Debugging Tests

### 1. Run Single Test

```bash
npm test -- -t "should return a concert by id"
```

### 2. View Console Logs

Add `console.log()` statements in tests (they will display during test runs)

### 3. Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Coverage Reports

After running `npm run test:cov`, view the coverage report:

```bash
open coverage/lcov-report/index.html
```

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Integration Testing

For integration tests with real database:

1. Create separate test database
2. Use `@nestjs/testing` utilities
3. Set up test fixtures
4. Clean up after tests

Example setup:

```typescript
beforeAll(async () => {
  const module = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'test',
        password: 'test',
        database: 'concert_api_test',
        entities: [Concert],
        synchronize: true,
      }),
      ConcertModule,
    ],
  }).compile();
  
  app = module.createNestApplication();
  await app.init();
});

afterAll(async () => {
  await app.close();
});
```

## CI/CD Integration

Tests should run automatically in CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm test
      - run: npm run test:cov
```

## Troubleshooting

### Issue: Tests timeout

**Solution**: Increase timeout in test file:
```typescript
jest.setTimeout(10000); // 10 seconds
```

### Issue: Mock not working

**Solution**: Ensure mocks are cleared between tests:
```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### Issue: Async test not completing

**Solution**: Ensure you're using `async/await` or returning promises:
```typescript
it('should work', async () => {
  await service.method();
  expect(something).toBe(true);
});
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [TypeORM Testing](https://typeorm.io/#/testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
