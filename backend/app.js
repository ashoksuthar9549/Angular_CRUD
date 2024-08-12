import fs from 'node:fs/promises';
import bodyParser from 'body-parser';
import express from 'express';

const app = express();

app.use(express.static('images'));
app.use(bodyParser.json());

// CORS setup
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all domains
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

const usersFilePath = './data/users.json';

// Generate a random token
// const generateToken = () => crypto.randomBytes(16).toString('hex');
// const authToken = generateToken();

// constant token
const authToken = '769d87884973392670100892185e5ca1';

console.log(`Your authentication token is: ${authToken}`);

// Helper function to read users from JSON file
async function readUsersFromFile() {
  try {
    const usersData = await fs.readFile(usersFilePath, 'utf8');
    return JSON.parse(usersData);
  } catch (err) {
    return []; // Return empty array if file read fails or file is empty
  }
}

// Helper function to write users to JSON file
async function writeUsersToFile(users) {
  try {
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error writing users to file:', err);
  }
}

// Validation middleware
const validateUser = (req, res, next) => {
  const { username, email, phoneNumber } = req.body;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/; //+1 (322) 956-6305

  if (!username || typeof username !== 'string' || username.trim() === '') {
    return res.status(400).json({ message: 'Invalid or missing username' });
  }

  if (!email || !emailPattern.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!phoneNumber || !phonePattern.test(phoneNumber)) {
    return res.status(400).json({ message: 'Invalid phone number format. It should be 10 digits.' });
  }

  next();
};

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (token === `Bearer ${authToken}`) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden. Invalid or missing token.' });
  }
};

// GET all users
// app.get('/users', authenticate, async (req, res) => {
//   const users = await readUsersFromFile();
//   res.json(users);
// });

// GET all users with pagination, filtering and sorting 
app.get('/users', authenticate, async (req, res) => {
  const { username, email, phoneNumber, isActive, page = 1, limit = 10, sortField = 'username', sortOrder = 'asc' } = req.query;
  let users = await readUsersFromFile();

  // Filter users
  if (username) {
    users = users.filter(user => user.username.toLowerCase().includes(username.toLowerCase()));
  }
  if (email) {
    users = users.filter(user => user.email.toLowerCase().includes(email.toLowerCase()));
  }
  if (phoneNumber) {
    users = users.filter(user => user.phoneNumber.includes(phoneNumber));
  }
  if (isActive !== undefined) {
    users = users.filter(user => user.isActive.toString() === isActive);
  }

  // Sort users
  users.sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalUsers = users.length;
  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  const paginatedUsers = users.slice(start, end);

  res.json({
    users: paginatedUsers,
    totalUsers,
    totalPages: Math.ceil(totalUsers / limit),
    currentPage: parseInt(page)
  });
});

// GET a single user by ID
app.get('/users/:id', authenticate, async (req, res) => {
  const users = await readUsersFromFile();
  const userId = req.params.id;
  const user = users.find(user => user.id === userId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// POST create a new user
app.post('/users', authenticate, validateUser, async (req, res) => {
  const users = await readUsersFromFile();
  const newUser = {
    id: Date.now().toString(),
    username: req.body.username,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    isActive: req.body.isActive,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await writeUsersToFile(users);

  res.status(201).json(newUser);
});

// PUT update a user by ID
app.put('/users/:id', authenticate, validateUser, async (req, res) => {
  const users = await readUsersFromFile();
  const userId = req.params.id;
  const updateUserIndex = users.findIndex(user => user.id === userId);

  if (updateUserIndex === -1) {
    res.status(404).json({ message: 'User not found' });
  } else {
    users[updateUserIndex] = {
      ...users[updateUserIndex],
      username: req.body.username || users[updateUserIndex].username,
      email: req.body.email || users[updateUserIndex].email,
      phoneNumber: req.body.phoneNumber || users[updateUserIndex].phoneNumber,
    };

    await writeUsersToFile(users);
    res.json({ message: 'User updated', user: users[updateUserIndex] });
  }
});

// DELETE a user by ID
app.delete('/users/:id', authenticate, async (req, res) => {
  const users = await readUsersFromFile();
  const userId = req.params.id;
  const filteredUsers = users.filter(user => user.id !== userId);

  if (filteredUsers.length === users.length) {
    res.status(404).json({ message: 'User not found' });
  } else {
    await writeUsersToFile(filteredUsers);
    res.json({ message: 'User deleted' });
  }
});

// PATCH toggle active/inactive status
app.patch('/users/:id/toggle', authenticate, async (req, res) => {
  const users = await readUsersFromFile();
  const userId = req.params.id;
  const updateUserIndex = users.findIndex(user => user.id === userId);

  if (updateUserIndex === -1) {
    res.status(404).json({ message: 'User not found' });
  } else {
    users[updateUserIndex] = {
      ...users[updateUserIndex],
      isActive: !users[updateUserIndex].isActive,
    };

    await writeUsersToFile(users);
    res.json({ message: 'User status updated', user: users[updateUserIndex] });
  }
});

// Handle 404 - Not Found
app.use((req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  res.status(404).json({ message: '404 - Not Found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
