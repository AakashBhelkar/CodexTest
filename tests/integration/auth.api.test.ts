import request from 'supertest';

import { app } from '../../src/app';
import { userStore } from '../../src/services/user.store';
import { authMock } from '../mocks/auth.mock';

describe('Auth API', () => {
  beforeEach(() => {
    userStore.clear();
  });

  it('signs up a user and returns JWT token', async () => {
    const response = await request(app).post('/api/auth/signup').send(authMock.validUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe(authMock.validUser.email);
  });

  it('logs in existing user and returns JWT token', async () => {
    await request(app).post('/api/auth/signup').send(authMock.validUser);

    const response = await request(app).post('/api/auth/login').send(authMock.validUser);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('rejects invalid credentials', async () => {
    await request(app).post('/api/auth/signup').send(authMock.validUser);

    const response = await request(app)
      .post('/api/auth/login')
      .send(authMock.invalidPasswordUser);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('invalid credentials');
  });

  it('blocks protected route without token', async () => {
    const response = await request(app).get('/api/me');

    expect(response.status).toBe(401);
  });

  it('allows protected route with valid token', async () => {
    const signupResponse = await request(app).post('/api/auth/signup').send(authMock.validUser);

    const token = signupResponse.body.token;

    const response = await request(app).get('/api/me').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(authMock.validUser.email);
  });
});
