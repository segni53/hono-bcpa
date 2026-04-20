import { Hono } from 'hono'

type PublicUser = Omit<User, 'password'>

interface User {
  id: string
  name: string
  email: string
  password: string
}

interface AuthBody {
  name?: string
  email?: string
  password?: string
}

const app = new Hono()
const users: User[] = []

const generateId = (): string => crypto.randomUUID()

const stripPassword = ({ password, ...user }: User): PublicUser => user

app.get('/', (c) => c.text('Hello Hono!'))

app.get('/users', (c) => {
  return c.json(users.map(stripPassword))
})

app.get('/users/:id', (c) => {
  const user = users.find((entry) => entry.id === c.req.param('id'))

  if (!user) {
    return c.json({ message: 'User not found' }, 404)
  }

  return c.json(stripPassword(user))
})

app.post('/signup', async (c) => {
  const { name, email, password } = (await c.req.json()) as AuthBody

  if (!name || !email || !password) {
    return c.json({ message: 'All fields are required' }, 400)
  }

  const existingUser = users.find((entry) => entry.email === email)
  if (existingUser) {
    return c.json({ message: 'Email already exists' }, 400)
  }

  const newUser: User = {
    id: generateId(),
    name,
    email,
    password,
  }

  users.push(newUser)

  return c.json(stripPassword(newUser), 201)
})

app.post('/signin', async (c) => {
  const { email, password } = (await c.req.json()) as AuthBody

  if (!email || !password) {
    return c.json({ message: 'Email and password are required' }, 400)
  }

  const user = users.find((entry) => entry.email === email)

  if (!user) {
    return c.json({ message: 'User not found' }, 404)
  }

  if (user.password !== password) {
    return c.json({ message: 'Invalid credentials' }, 401)
  }

  return c.json({
    message: 'Login successful',
    user: stripPassword(user),
  })
})

export default {
  port: 3000,
  fetch: app.fetch,
}
