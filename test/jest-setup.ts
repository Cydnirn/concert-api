// Jest setup file to handle module issues
process.env.NODE_ENV = 'test';

import * as path from 'path';

// Mock app-root-path to prevent TypeORM connection issues in tests
jest.mock('app-root-path', () => ({
  path: process.cwd(),
  resolve: (pathToResolve: string) => {
    return path.resolve(process.cwd(), pathToResolve);
  },
  toString: () => process.cwd(),
}));
