import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  setupFiles: ['<rootDir>/tests/setup-env.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  clearMocks: true,
};

export default config;
