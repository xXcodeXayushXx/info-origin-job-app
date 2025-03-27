import { useState, useEffect } from "react";

export default function JobPortal() {
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({ postProfile: "", postDesc: "", reqExperience: "", postTechStack: "" });
  const [user, setUser] = useState(null);
  const [authData, setAuthData] = useState({ username: "", password: "", role: "" });

  useEffect(() => {
    if (user) {
      fetch("http://localhost:8080/jobPosts")
        .then((res) => res.json())
        .then((data) => setJobs(data));
    }
  }, [user]);

  const handleAuth = (endpoint, role) => {
    console.log("Attempting to", endpoint, "as", role);
    
    fetch(`http://localhost:8080/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...authData, role }), 
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Response from server:", data);
        if (data.user) {
          setUser(data.user);
        } else {
          alert(data.message);
        }
      })
      .catch((err) => console.error("Error:", err));
  };

  const handleLogout = () => {
    fetch("http://localhost:8080/logout", { method: "POST" })
      .then(() => setUser(null))
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

  const handleApply = (job) => {
    console.log(job);
    const recruiterNumber = "7060222014";
    const message = `Hello, I'm interested in the ${job.postProfile} JID (${job.postId}) postion, description ${job.postDesc}. Can we discuss this opportunity?`;
    
    const encodedMessage = encodeURIComponent(message);
  
    window.open(`https://wa.me/${recruiterNumber}?text=${encodedMessage}`, "_blank");
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
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden w-full max-w-4xl grid grid-cols-2">
          {/* Candidate Section */}
          <div className="bg-blue-50 p-12 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-blue-800 mb-6 text-center">Candidate Portal</h2>
            <div className="space-y-4">
              <input 
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
                placeholder="Username" 
                onChange={(e) => setAuthData(prev => ({ ...prev, username: e.target.value }))} 
              />
              <input 
                type="password" 
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
                placeholder="Password" 
                onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))} 
              />
              <div className="flex space-x-4">
                <button 
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition" 
                  onClick={() => handleAuth("login", "candidate")}
                >
                  Login
                </button>
                <button 
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition" 
                  onClick={() => handleAuth("signup", "candidate")}
                >
                  Signup
                </button>
              </div>
            </div>
          </div>
          
          {/* Recruiter Section */}
          <div className="bg-gray-50 p-12 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Recruiter Portal</h2>
            <div className="space-y-4">
              <input 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition" 
                placeholder="Username" 
                onChange={(e) => setAuthData(prev => ({ ...prev, username: e.target.value }))} 
              />
              <input 
                type="password" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition" 
                placeholder="Password" 
                onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))} 
              />
              <div className="flex space-x-4">
                <button 
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition" 
                  onClick={() => handleAuth("login", "recruiter")}
                >
                  Login
                </button>
                <button 
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition" 
                  onClick={() => handleAuth("signup", "recruiter")}
                >
                  Signup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-blue-800">
            Welcome, {user.username} 
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
          <div>
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Available Jobs</h2>
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
                    className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                    onClick={() => handleApply(job)}
                  >
                    Apply via WhatsApp
                  </button>
                </div>
              ))}
            </div>
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