/********************************************************************************
*  WEB322 – Assignment 05
*  
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*  
*  Name: Vishavjeet Khatri Student ID: 150215234 Date: 2025-03-23
********************************************************************************/

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
app.use(express.urlencoded({ extended: true })); // Required for form submissions

// Routes
app.get("/", (req, res) => res.render("home", { page: "/" }));
app.get("/about", (req, res) => res.render("about", { page: "/about" }));

// List Projects
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

// View Single Project
app.get("/solutions/projects/:id", (req, res) => {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) return res.status(400).render("404", { message: "Invalid project ID" });

    projectData.getProjectById(projectId)
        .then(project => res.render("project", { project, page: "" }))
        .catch(err => res.status(404).render("404", { message: "Project not found" }));
});

/* ------------------------------
   Assignment 5 Routes 
--------------------------------*/

// GET Add Project Form
app.get("/solutions/addProject", (req, res) => {
    projectData.getAllSectors()
        .then(sectors => {
            res.render("addProject", { sectors, page: "/solutions/addProject" });
        })
        .catch(err => {
            res.render("500", { message: `Error retrieving sectors: ${err}` });
        });
});

// POST Add Project
app.post("/solutions/addProject", (req, res) => {
    projectData.addProject(req.body)
        .then(() => res.redirect("/solutions/projects"))
        .catch(err => res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` }));
});

// GET Edit Project Form
app.get("/solutions/editProject/:id", (req, res) => {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) return res.status(400).render("404", { message: "Invalid project ID" });

    Promise.all([
        projectData.getProjectById(projectId),
        projectData.getAllSectors()
    ])
    .then(([project, sectors]) => {
        res.render("editProject", { project, sectors, page: "" });
    })
    .catch(err => res.status(404).render("404", { message: err }));
});

// POST Edit Project
app.post("/solutions/editProject", (req, res) => {
    projectData.editProject(req.body.id, req.body)
        .then(() => res.redirect("/solutions/projects"))
        .catch(err => res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` }));
});

// GET Delete Project
app.get("/solutions/deleteProject/:id", (req, res) => {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) return res.status(400).render("404", { message: "Invalid project ID" });

    projectData.deleteProject(projectId)
        .then(() => res.redirect("/solutions/projects"))
        .catch(err => res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` }));
});

/* ------------------------------ */

// 404 Handler
app.use((req, res) => res.status(404).render("404", { 
    message: "Page not found", 
    page: "" 
}));

// Initialize + Start Server
projectData.initialize().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
