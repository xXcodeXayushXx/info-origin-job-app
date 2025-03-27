const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());

let jobId = 3;

// Dummy in-memory users (Replace with DB in production)
const candidates = [];
const recruiters = [];

// **POST /signup** - Register a new user (Recruiter or Candidate)
app.post("/signup", (req, res) => {
    const { username, password, role } = req.body;

    if (!role || (role !== "candidate" && role !== "recruiter")) {
        return res.status(400).json({ message: "Invalid role! Must be 'candidate' or 'recruiter'." });
    }

    const newUser = { id: Date.now(), username, password, role }; // Plain text password (not recommended for real apps)

    if (role === "candidate") {
        if (candidates.find((user) => user.username === username)) {
            return res.status(400).json({ message: "Candidate already exists!" });
        }
        candidates.push(newUser);
    } else if (role === "recruiter") {
        if (recruiters.find((user) => user.username === username)) {
            return res.status(400).json({ message: "Recruiter already exists!" });
        }
        recruiters.push(newUser);
    }

    res.json({ message: "Signup successful!", user: newUser });
});

// **POST /login** - Authenticate user
app.post("/login", (req, res) => {
    const { username, password, role } = req.body;
    
    if (!role || (role !== "candidate" && role !== "recruiter")) {
        return res.status(400).json({ message: "Invalid role! Must be 'candidate' or 'recruiter'." });
    }

    let user = null;

    if (role === "candidate") {
        user = candidates.find((u) => u.username === username && u.password === password);
    } else if (role === "recruiter") {
        user = recruiters.find((u) => u.username === username && u.password === password);
    }

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials!" });
    }

    res.json({
        message: `Login successful! Welcome, ${user.username}.`,
        user: { id: user.id, username: user.username, role: user.role },
    });
});


app.post("/logout", (req, res) => {
    res.json({ message: "Logout successful!" });
  });


// Dummy in-memory job posts (Replace with DB in production)
let jobPosts = [
  {
    postId: 1,
    postProfile: "Software Engineer",
    postDesc: "Develop and maintain web applications.",
    reqExperience: 3,
    postTechStack: ["JavaScript", "React", "Node.js"],
  },
  {
    postId: 2,
    postProfile: "Data Scientist",
    postDesc: "Work with ML models and big data.",
    reqExperience: 5,
    postTechStack: ["Python", "TensorFlow", "SQL"],
  },
];

// **GET /jobPosts** - Fetch all job posts
app.get("/jobPosts", (req, res) => {
  res.json(jobPosts);
});

// **GET /jobPost/:id** - Fetch a job post by ID
app.get("/jobPost/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const job = jobPosts.find((post) => post.postId === id);
  if (job) {
    res.json(job);
  } else {
    res.status(404).json({ message: "Job post not found!" });
  }
});

// **POST /jobPost** - Create a new job post
app.post("/jobPost", (req, res) => {
  const newJob = { postId: jobId++, ...req.body };
  jobPosts.push(newJob);
  res.json({ message: "Job post created successfully!", newJob });
});

// **PUT /jobPost/:id** - Update an existing job post
app.put("/jobPost/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = jobPosts.findIndex((post) => post.postId === id);
  if (index !== -1) {
    jobPosts[index] = { ...jobPosts[index], ...req.body };
    res.json({ message: "Job post updated successfully!", updatedJob: jobPosts[index] });
  } else {
    res.status(404).json({ message: "Job post not found!" });
  }
});

// **DELETE /jobPost/:id** - Delete a job post
app.delete("/jobPost/:id", (req, res) => {
  const id = parseInt(req.params.id);
  jobPosts = jobPosts.filter((post) => post.postId !== id);
  res.json({ message: "Job post deleted successfully!" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
