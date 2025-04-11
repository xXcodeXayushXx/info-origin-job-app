const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 8080;


app.use(cors());
app.use(express.json());

let jobId = 3;

const candidates = [];
const jobApplications = []; // Store job applications

// Predefined recruiter credentials
const recruiter = {
    id: 1,
    username: "admin",
    password: "admin123"
};

app.post("/signup/candidate", (req, res) => {
    const { username, password, name, email, contact, city, skills } = req.body;

    // Validate required fields
    if (!username || !password || !name || !email || !contact || !city || !skills) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    // Check if candidate already exists
    if (candidates.find((user) => user.username === username)) {
        return res.status(400).json({ message: "Username already exists!" });
    }

    // Create new candidate
    const newCandidate = {
        id: Date.now(),
        username,
        password,
        name,
        email,
        contact,
        city,
        skills,
        role: "candidate"
    };

    candidates.push(newCandidate);
    
    // Remove password from response
    const { password: _, ...candidateResponse } = newCandidate;
    res.json({ message: "Signup successful!", user: candidateResponse });
});

app.post("/login", (req, res) => {
    const { username, password, role } = req.body;
    
    if (!role || (role !== "candidate" && role !== "recruiter")) {
        return res.status(400).json({ message: "Invalid role! Must be 'candidate' or 'recruiter'." });
    }

    let user = null;

    if (role === "candidate") {
        user = candidates.find((u) => u.username === username && u.password === password);
        if (user) {
            const { password: _, ...userResponse } = user;
            return res.json({
                message: `Login successful! Welcome, ${user.name}.`,
                user: userResponse
            });
        }
    } else if (role === "recruiter") {
        if (username === recruiter.username && password === recruiter.password) {
            const { password: _, ...recruiterResponse } = recruiter;
            return res.json({
                message: "Login successful! Welcome, Recruiter.",
                user: { ...recruiterResponse, role: "recruiter" }
            });
        }
    }

    return res.status(401).json({ message: "Invalid credentials!" });
});


app.post("/logout", (req, res) => {
    res.json({ message: "Logout successful!" });
  });



let jobPosts = [
  {
    postId: 1,
    postProfile: "postProfile 1",
    postDesc: "postDesc1",
    reqExperience: 1,
    postTechStack: ["postTechStack1", "postTechStack2", "postTechStack3"],
  },
  {
    postId: 2,
    postProfile: "postProfile 2",
    postDesc: "postDesc2",
    reqExperience: 2,
    postTechStack: ["postTechStack1", "postTechStack2", "postTechStack3"],
  },
];

// Get all job posts with application status for a candidate
app.get("/jobPosts/:candidateId", (req, res) => {
  const candidateId = parseInt(req.params.candidateId);
  const jobsWithStatus = jobPosts.map(job => {
    const hasApplied = jobApplications.some(
      app => app.jobId === job.postId && app.candidateId === candidateId
    );
    return { ...job, hasApplied };
  });
  res.json(jobsWithStatus);
});

// Apply for a job
app.post("/apply", (req, res) => {
  const { candidateId, jobId } = req.body;
  
  // Check if already applied
  const existingApplication = jobApplications.find(
    app => app.jobId === jobId && app.candidateId === candidateId
  );
  
  if (existingApplication) {
    return res.status(400).json({ message: "Already applied to this job!" });
  }
  
  // Create new application
  const application = {
    id: Date.now(),
    candidateId,
    jobId,
    appliedAt: new Date(),
    status: "pending" // pending, accepted, rejected
  };
  
  jobApplications.push(application);
  res.json({ message: "Application submitted successfully!", application });
});

// Get applications for a job (for recruiter)
app.get("/applications/:jobId", (req, res) => {
  const jobId = parseInt(req.params.jobId);
  const applications = jobApplications
    .filter(app => app.jobId === jobId)
    .map(app => {
      const candidate = candidates.find(c => c.id === app.candidateId);
      return {
        ...app,
        candidate: candidate ? {
          name: candidate.name,
          email: candidate.email,
          contact: candidate.contact,
          city: candidate.city,
          skills: candidate.skills
        } : null
      };
    });
  res.json(applications);
});

app.get("/jobPost/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const job = jobPosts.find((post) => post.postId === id);
  if (job) {
    res.json(job);
  } else {
    res.status(404).json({ message: "Job post not found!" });
  }
});

app.post("/jobPost", (req, res) => {
  const newJob = { postId: jobId++, ...req.body };
  jobPosts.push(newJob);
  res.json({ message: "Job post created successfully!", newJob });
});

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

app.delete("/jobPost/:id", (req, res) => {
  const id = parseInt(req.params.id);
  jobPosts = jobPosts.filter((post) => post.postId !== id);
  res.json({ message: "Job post deleted successfully!" });
});

// Get all candidates (for recruiter)
app.get("/candidates", (req, res) => {
  // Remove sensitive information like passwords
  const sanitizedCandidates = candidates.map(({ password, ...candidate }) => candidate);
  res.json(sanitizedCandidates);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
