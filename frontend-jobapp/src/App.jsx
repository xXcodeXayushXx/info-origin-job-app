import { useState, useEffect } from "react";

export default function JobPortal() {
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({ postProfile: "", postDesc: "", reqExperience: "", postTechStack: "" });
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("landing"); // landing, candidateLogin, candidateSignup, recruiterAuth
  const [activeTab, setActiveTab] = useState("profile"); // profile, jobs
  const [activeJobTab, setActiveJobTab] = useState("newJobs"); // newJobs, appliedJobs
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [authData, setAuthData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    contact: "",
    city: "",
    skills: ""
  });

  useEffect(() => {
    if (user) {
      const endpoint = user.role === "candidate" 
        ? `http://localhost:8080/jobPosts/${user.id}`
        : "http://localhost:8080/jobPosts/0";
        
      fetch(endpoint)
        .then((res) => res.json())
        .then((data) => {
          setJobs(data);
          setAppliedJobs(data.filter(job => job.hasApplied));
        });
    }
  }, [user]);

  const handleCandidateAuth = (endpoint) => {
    fetch(`http://localhost:8080/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...authData, role: "candidate" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setPage("landing");
        } else {
          alert(data.message);
        }
      })
      .catch((err) => console.error("Error:", err));
  };

  const handleRecruiterLogin = () => {
    fetch("http://localhost:8080/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: authData.username,
        password: authData.password,
        role: "recruiter"
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setPage("landing");
        } else {
          alert(data.message);
        }
      })
      .catch((err) => console.error("Error:", err));
  };

  const handleLogout = () => {
    fetch("http://localhost:8080/logout", { method: "POST" })
      .then(() => {
        setUser(null);
        setPage("landing");
        setAuthData({
          username: "",
          password: "",
          name: "",
          email: "",
          contact: "",
          city: "",
          skills: ""
        });
      })
      .catch((err) => console.error("Logout error:", err));
  };

  const handlePostJob = () => {
    fetch("http://localhost:8080/jobPost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newJob),
    })
      .then((res) => res.json())
      .then((data) => {
        setJobs([...jobs, data.newJob]);
        setNewJob({ postProfile: "", postDesc: "", reqExperience: "", postTechStack: "" });
      })
      .catch((err) => console.error("Error posting job:", err));
  };

  const handleApply = (jobId) => {
    fetch("http://localhost:8080/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateId: user.id,
        jobId: jobId
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.application) {
          setJobs(jobs.map(job => 
            job.postId === jobId 
              ? { ...job, hasApplied: true }
              : job
          ));
          alert("Application submitted successfully!");
        } else {
          alert(data.message);
        }
      })
      .catch((err) => {
        console.error("Error applying to job:", err);
        alert("Failed to submit application. Please try again.");
      });
  };

  const handleDeleteJob = (postId) => {
    fetch(`http://localhost:8080/jobPost/${postId}`, {
        method: "DELETE",
    })
    .then((res) => res.json())
    .then((data) => {
        console.log(data.message);
        setJobs(jobs.filter((job) => job.postId !== postId)); 
    })
    .catch((err) => console.error("Error deleting job:", err));
  };
  
  // Candidate dashboard components
  const CandidateProfile = () => (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <h3 className="text-2xl font-bold text-blue-800 mb-6">Profile Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600 font-semibold">Full Name</p>
          <p className="text-blue-800">{user.name}</p>
        </div>
        <div>
          <p className="text-gray-600 font-semibold">Username</p>
          <p className="text-blue-800">{user.username}</p>
        </div>
        <div>
          <p className="text-gray-600 font-semibold">Email</p>
          <p className="text-blue-800">{user.email}</p>
        </div>
        <div>
          <p className="text-gray-600 font-semibold">Contact</p>
          <p className="text-blue-800">{user.contact}</p>
        </div>
        <div>
          <p className="text-gray-600 font-semibold">City</p>
          <p className="text-blue-800">{user.city}</p>
        </div>
        <div>
          <p className="text-gray-600 font-semibold">Skills</p>
          <p className="text-blue-800">{user.skills}</p>
        </div>
      </div>
    </div>
  );

  const JobTabs = () => (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            className={`py-4 px-1 ${
              activeJobTab === "newJobs"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
            onClick={() => setActiveJobTab("newJobs")}
          >
            Available Jobs
          </button>
          <button
            className={`py-4 px-1 ${
              activeJobTab === "appliedJobs"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
            onClick={() => setActiveJobTab("appliedJobs")}
          >
            Applied Jobs
          </button>
        </div>
      </div>

      {activeJobTab === "newJobs" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.filter(job => !job.hasApplied).map((job) => (
            <div
              key={job.postId}
              className="bg-white border border-blue-100 rounded-xl p-6 shadow-md hover:shadow-xl transition transform hover:-translate-y-2"
            >
              <h3 className="text-xl font-semibold text-blue-800 mb-2">{job.postProfile}</h3>
              <p className="text-gray-600 mb-4">{job.postDesc}</p>
              <p className="text-sm text-blue-600 mb-4">
                Experience: {job.reqExperience} years
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Skills: {Array.isArray(job.postTechStack) ? job.postTechStack.join(", ") : job.postTechStack}
                </p>
                <button
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition"
                  onClick={() => handleApply(job.postId)}
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appliedJobs.map((job) => (
            <div
              key={job.postId}
              className="bg-white border border-blue-100 rounded-xl p-6 shadow-md"
            >
              <h3 className="text-xl font-semibold text-blue-800 mb-2">{job.postProfile}</h3>
              <p className="text-gray-600 mb-4">{job.postDesc}</p>
              <p className="text-sm text-blue-600 mb-4">
                Experience: {job.reqExperience} years
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Skills: {Array.isArray(job.postTechStack) ? job.postTechStack.join(", ") : job.postTechStack}
                </p>
                <div className="bg-gray-100 text-gray-600 py-2 px-4 rounded-lg text-center">
                  Applied
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!user) {
    if (page === "landing") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden w-full max-w-2xl p-8">
            <h1 className="text-4xl font-bold text-blue-800 mb-8 text-center">Job Portal</h1>
            <div className="grid grid-cols-2 gap-6">
              <button
                className="bg-blue-600 text-white py-4 px-8 rounded-lg hover:bg-blue-700 transition text-xl"
                onClick={() => setPage("candidateLogin")}
              >
                Candidate
              </button>
              <button
                className="bg-green-600 text-white py-4 px-8 rounded-lg hover:bg-green-700 transition text-xl"
                onClick={() => setPage("recruiterAuth")}
              >
                Recruiter
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (page === "candidateLogin") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-blue-800">Candidate Login</h2>
              <button
                className="text-blue-600 hover:text-blue-800"
                onClick={() => setPage("landing")}
              >
                Back
              </button>
            </div>
            <div className="space-y-4">
              <input
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Username"
                value={authData.username}
                onChange={(e) => setAuthData(prev => ({ ...prev, username: e.target.value }))}
              />
              <input
                type="password"
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
                value={authData.password}
                onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
              />
              <button
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                onClick={() => handleCandidateAuth("login")}
              >
                Login
              </button>
              <div className="text-center">
                <p className="text-gray-600">Don't have an account?</p>
                <button
                  className="text-blue-600 hover:text-blue-800 font-semibold mt-1"
                  onClick={() => setPage("candidateSignup")}
                >
                  Sign up here
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (page === "candidateSignup") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden w-full max-w-4xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-blue-800">Candidate Registration</h2>
              <button
                className="text-blue-600 hover:text-blue-800"
                onClick={() => setPage("candidateLogin")}
              >
                Back to Login
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Username"
                value={authData.username}
                onChange={(e) => setAuthData(prev => ({ ...prev, username: e.target.value }))}
              />
              <input
                type="password"
                className="px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
                value={authData.password}
                onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
              />
              <input
                className="px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full Name"
                value={authData.name}
                onChange={(e) => setAuthData(prev => ({ ...prev, name: e.target.value }))}
              />
              <input
                type="email"
                className="px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email"
                value={authData.email}
                onChange={(e) => setAuthData(prev => ({ ...prev, email: e.target.value }))}
              />
              <input
                className="px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contact Number"
                value={authData.contact}
                onChange={(e) => setAuthData(prev => ({ ...prev, contact: e.target.value }))}
              />
              <input
                className="px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City"
                value={authData.city}
                onChange={(e) => setAuthData(prev => ({ ...prev, city: e.target.value }))}
              />
              <input
                className="px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                placeholder="Skills (comma separated)"
                value={authData.skills}
                onChange={(e) => setAuthData(prev => ({ ...prev, skills: e.target.value }))}
              />
            </div>
            <div className="mt-6">
              <button
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
                onClick={() => handleCandidateAuth("signup/candidate")}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (page === "recruiterAuth") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-blue-800">Recruiter Login</h2>
              <button
                className="text-blue-600 hover:text-blue-800"
                onClick={() => setPage("landing")}
              >
                Back
              </button>
            </div>
            <div className="space-y-4">
              <input
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Username"
                value={authData.username}
                onChange={(e) => setAuthData(prev => ({ ...prev, username: e.target.value }))}
              />
              <input
                type="password"
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
                value={authData.password}
                onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
              />
              <button
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                onClick={handleRecruiterLogin}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-blue-800">
            Welcome, {user.name || user.username}
            <span className="text-sm text-gray-500 ml-2">({user.role})</span>
          </h2>
          <button
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {user.role === "candidate" ? (
          <div className="space-y-6">
            <div className="border-b border-gray-200">
              <div className="flex space-x-8">
                <button
                  className={`py-4 px-1 ${
                    activeTab === "profile"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-blue-500"
                  }`}
                  onClick={() => setActiveTab("profile")}
                >
                  Profile
                </button>
                <button
                  className={`py-4 px-1 ${
                    activeTab === "jobs"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-blue-500"
                  }`}
                  onClick={() => setActiveTab("jobs")}
                >
                  Jobs
                </button>
              </div>
            </div>

            {activeTab === "profile" ? <CandidateProfile /> : <JobTabs />}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Manage Jobs</h2>
            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <input
                  className="px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Job Title"
                  value={newJob.postProfile}
                  onChange={(e) => setNewJob({ ...newJob, postProfile: e.target.value })}
                />
                <input
                  className="px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description"
                  value={newJob.postDesc}
                  onChange={(e) => setNewJob({ ...newJob, postDesc: e.target.value })}
                />
                <input
                  type="number"
                  className="px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Experience"
                  value={newJob.reqExperience}
                  onChange={(e) => setNewJob({ ...newJob, reqExperience: e.target.value })}
                />
                <input
                  className="px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tech Stack"
                  value={newJob.postTechStack}
                  onChange={(e) => setNewJob({ ...newJob, postTechStack: e.target.value.split(",") })}
                />
              </div>
              <button
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                onClick={handlePostJob}
              >
                Post Job
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.postId}
                  className="bg-white border border-blue-100 rounded-xl p-6 shadow-md hover:shadow-xl transition transform hover:-translate-y-2"
                >
                  <h3 className="text-xl font-semibold text-blue-800 mb-2">{job.postProfile}</h3>
                  <p className="text-gray-600 mb-4">{job.postDesc}</p>
                  <p className="text-sm text-blue-600 mb-4">
                    Experience: {job.reqExperience} years
                  </p>
                  <button
                    className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                    onClick={() => handleDeleteJob(job.postId)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}