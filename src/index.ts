import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})
import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

const PORT = 3000;

// User type
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

// In-memory store
let users: User[] = [];

// Generate unique ID
const generateId = (): string => Date.now().toString();


// 1. Get All Users
app.get("/users", (req: Request, res: Response) => {
  const usersWithoutPasswords = users.map(({ password, ...rest }) => rest);
  res.json(usersWithoutPasswords);
});


// 2. Get User by ID
app.get("/users/:id", (req: Request, res: Response) => {
  const user = users.find(u => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});


// 3. Signup
app.post("/signup", (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const newUser: User = {
    id: generateId(),
    name,
    email,
    password
  };

  users.push(newUser);

  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json(userWithoutPassword);
});


// 4. Signin
app.post("/signin", (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const { password: _, ...userWithoutPassword } = user;

  res.json({
    message: "Login successful",
    user: userWithoutPassword
  });
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app
