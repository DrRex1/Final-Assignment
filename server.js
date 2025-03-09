/***********************
* WEB322 – Assignment 04
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Vishavjeet Khatri Student ID: 150215234 Date: 2024-03-10
*******************************************************************************/
const express = require("express");
const projectData = require("./modules/projects");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Configure EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => res.render("home", { page: "/" }));
app.get("/about", (req, res) => res.render("about", { page: "/about" }));

app.get("/solutions/projects", (req, res) => {
    const sector = req.query.sector;
    const promise = sector ? projectData.getProjectsBySector(sector) : projectData.getAllProjects();

    promise.then(projects => {
        if (projects.length === 0 && sector) {
            res.status(404).render("404", { 
                message: `No projects found for sector: ${sector}`,
                page: ""
            });
        } else {
            res.render("projects", { 
                projects, 
                page: "/solutions/projects" 
            });
        }
    }).catch(err => res.status(404).render("404", { message: err }));
});

app.get("/solutions/projects/:id", (req, res) => {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) return res.status(400).render("404", { message: "Invalid project ID" });

    projectData.getProjectById(projectId)
        .then(project => res.render("project", { project, page: "" }))
        .catch(err => res.status(404).render("404", { message: "Project not found" }));
});

// 404 Handler
app.use((req, res) => res.status(404).render("404", { 
    message: "Page not found", 
    page: "" 
}));

// Initialize
projectData.initialize().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});