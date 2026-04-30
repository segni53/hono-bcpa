import { Hono } from 'hono'
import { createUser, getUsers, updateUser, deleteUser } from './db';

type PublicUser = { id: number; name: string; email: string };
interface AuthBody {
  name?: string;
  email?: string;
  password?: string;
}

const app = new Hono()
const stripPassword = (user: any): PublicUser => {

  const { id, name, email } = user;
  return { id, name, email };
};

app.get('/', (c) => c.text('Hello Hono!'))

app.get('/users', async (c) => {
  const dbUsers = await getUsers();
  return c.json(dbUsers.map(stripPassword));
});

app.get('/users/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const dbUsers = await getUsers();
  const user = dbUsers.find((entry: any) => entry.id === id);
  if (!user) {
    return c.json({ message: 'User not found' }, 404);
  }
  return c.json(stripPassword(user));
});

app.post('/signup', async (c) => {
  const { name, email } = (await c.req.json()) as AuthBody;
  if (!name || !email) {
    return c.json({ message: 'Name and email are required' }, 400);
  }
  const dbUsers = await getUsers();
  if (dbUsers.some((u: any) => u.email === email)) {
    return c.json({ message: 'Email already exists' }, 400);
  }
  await createUser(name, email);
  const newUser = (await getUsers()).find((u: any) => u.email === email);
  return c.json(stripPassword(newUser), 201);
});

app.post('/signin', async (c) => {
  const { email } = (await c.req.json()) as AuthBody;
  if (!email) {
    return c.json({ message: 'Email is required' }, 400);
  }
  const dbUsers = await getUsers();
  const user = dbUsers.find((u: any) => u.email === email);
  if (!user) {
    return c.json({ message: 'User not found' }, 404);
  }
  return c.json({
    message: 'Login successful',
    user: stripPassword(user),
  });
});

export default {
  port: 3000,
  fetch: app.fetch,
}
