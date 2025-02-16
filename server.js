/*******************************************************************************
* WEB322 – Assignment 03
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: Vishavjeet Khatri Student ID: 150215234 Date: 2024-02-15
*******************************************************************************/
const express = require("express");
const projectData = require("./modules/projects");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Configure static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/home.html"));
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

// Updated project routes
app.get("/solutions/projects", (req, res) => {
    const sector = req.query.sector;
    
    if (sector) {
        projectData.getProjectsBySector(sector)
            .then(projects => res.json(projects))
            .catch(err => res.status(404).json({ error: err }));
    } else {
        projectData.getAllProjects()
            .then(projects => res.json(projects))
            .catch(err => res.status(500).json({ error: "Server error" }));
    }
});

app.get("/solutions/projects/:id", (req, res) => {
    const projectId = parseInt(req.params.id);
    
    if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
    }

    projectData.getProjectById(projectId)
        .then(project => res.json(project))
        .catch(err => res.status(404).json({ error: err }));
});

// Custom 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
});

// Initialize and start server
projectData.initialize()
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error("Initialization failed:", err);
        process.exit(1);
    });