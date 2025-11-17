import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/lib/prisma';

const api = () => request(app);

describe('Auth flow', () => {
  const email = `tester_${Date.now()}@example.com`;
  const senha = 'secret123';
  const nome = 'Tester';

  beforeAll(async () => {
    try {
      await prisma.$connect();
    } catch (e) {
      throw new Error('Database not available for tests. Check DATABASE_URL and migrations.');
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('register -> login -> me', async () => {
    const reg = await api()
      .post('/api/v1/auth/register')
      .send({ nome, email, senha, role: 'ALUNO' });
    expect(reg.status).toBe(201);
    expect(reg.body).toHaveProperty('id');
    expect(reg.body).not.toHaveProperty('senhaHash');

    const log = await api()
      .post('/api/v1/auth/login')
      .send({ email, senha });
    expect(log.status).toBe(200);
    expect(log.body).toHaveProperty('token');

    const token = log.body.token as string;
    const me = await api()
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body).toHaveProperty('email', email);
  });

  it('denies protected route without token', async () => {
    const res = await api().get('/api/v1/auth/me');
    expect([401, 403]).toContain(res.status);
  });

  it('allows protected RBAC route with token', async () => {
    const email2 = `rbac_${Date.now()}@example.com`;
    const senha2 = 'secret123';
    await api().post('/api/v1/auth/register').send({ nome: 'RBAC', email: email2, senha: senha2, role: 'ALUNO' });
    const log2 = await api().post('/api/v1/auth/login').send({ email: email2, senha: senha2 });
    const token2 = log2.body.token as string;
    const ok = await api().get('/api/v1/protected/ping').set('Authorization', `Bearer ${token2}`);
    expect(ok.status).toBe(200);
    expect(ok.body).toHaveProperty('ok', true);
  });
});
