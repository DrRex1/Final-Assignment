/********************************************************************************
*  WEB322 – Assignment 06
*  
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*  
*  Name: Vishavjeet Khatri Student ID: 150215234 Date: 2025-03-23
********************************************************************************/

const express = require("express");
const projectData = require("./modules/projects");
const authData = require("./modules/auth-service");
const clientSessions = require("client-sessions");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// EJS Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Session Config
app.use(clientSessions({
  cookieName: "session",
  secret: "yourSuperSecretString123",
  duration: 2 * 60 * 1000,
  activeDuration: 1000 * 60
}));

// Expose session to views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Auth middleware
function ensureLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

// ========== ROUTES ==========

// Home & About
app.get("/", (req, res) => res.render("home", { page: "/" }));
app.get("/about", (req, res) => res.render("about", { page: "/about" }));

// Project Listing
app.get("/solutions/projects", (req, res) => {
  const sector = req.query.sector;
  const fetchProjects = sector
    ? projectData.getProjectsBySector(sector)
    : projectData.getAllProjects();

  fetchProjects
    .then(projects => {
      if (projects.length === 0 && sector) {
        return res.status(404).render("404", {
          message: `No projects found for sector: ${sector}`,
          page: ""
        });
      }
      res.render("projects", {
        projects,
        page: "/solutions/projects"
      });
    })
    .catch(err => res.status(404).render("404", { message: err }));
});

// View Single Project
app.get("/solutions/projects/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).render("404", { message: "Invalid project ID" });

  projectData.getProjectById(id)
    .then(project => res.render("project", { project, page: "" }))
    .catch(() => res.status(404).render("404", { message: "Project not found" }));
});

// Add Project
app.get("/solutions/addProject", ensureLogin, (req, res) => {
  projectData.getAllSectors()
    .then(sectors => res.render("addProject", {
      sectors,
      page: "/solutions/addProject"
    }))
    .catch(err => res.render("500", { message: `Error retrieving sectors: ${err}` }));
});

app.post("/solutions/addProject", ensureLogin, (req, res) => {
  projectData.addProject(req.body)
    .then(() => res.redirect("/solutions/projects"))
    .catch(err => res.render("500", { message: `Error: ${err}` }));
});

// Edit Project
app.get("/solutions/editProject/:id", ensureLogin, (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).render("404", { message: "Invalid project ID" });

  Promise.all([
    projectData.getProjectById(id),
    projectData.getAllSectors()
  ])
    .then(([project, sectors]) =>
      res.render("editProject", { project, sectors, page: "" })
    )
    .catch(err => res.status(404).render("404", { message: err }));
});

app.post("/solutions/editProject", ensureLogin, (req, res) => {
  projectData.editProject(req.body.id, req.body)
    .then(() => res.redirect("/solutions/projects"))
    .catch(err => res.render("500", { message: `Error: ${err}` }));
});

// Delete Project
app.get("/solutions/deleteProject/:id", ensureLogin, (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).render("404", { message: "Invalid project ID" });

  projectData.deleteProject(id)
    .then(() => res.redirect("/solutions/projects"))
    .catch(err => res.render("500", { message: `Error: ${err}` }));
});

// ========== AUTH ROUTES ==========

app.get("/register", (req, res) => {
  res.render("register", {
    errorMessage: "",
    successMessage: "",
    userName: ""
  });
});

app.post("/register", (req, res) => {
  authData.registerUser(req.body)
    .then(() => {
      res.render("register", {
        successMessage: "User created",
        errorMessage: "",
        userName: ""
      });
    })
    .catch(err => {
      res.render("register", {
        successMessage: "",
        errorMessage: err,
        userName: req.body.userName
      });
    });
});

app.get("/login", (req, res) => {
  res.render("login", { errorMessage: "", userName: "" });
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");

  authData.checkUser(req.body)
    .then(user => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
      };
      res.redirect("/solutions/projects");
    })
    .catch(err => {
      res.render("login", {
        errorMessage: err,
        userName: req.body.userName
      });
    });
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory", { page: "/userHistory" });
});

// ========== FALLBACK ROUTE ==========

app.use((req, res) => {
  res.status(404).render("404", {
    message: "Page not found",
    page: ""
  });
});

// ========== DEPLOYMENT HANDLER ==========

if (process.env.NODE_ENV !== "production") {
  projectData.initialize()
    .then(authData.initialize)
    .then(() => {
      app.listen(PORT, () =>
        console.log(`✅ Server running at http://localhost:${PORT}`)
      );
    })
    .catch(err => console.error(`❌ Server start failed: ${err}`));
}

module.exports = (req, res) => {
  projectData.initialize()
    .then(authData.initialize)
    .then(() => app(req, res))
    .catch(err => res.status(500).send(`Server error: ${err}`));
};
