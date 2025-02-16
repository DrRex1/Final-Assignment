/********************************************************************************
* WEB322 – Assignment 02
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Vishavjeet Student ID: 150215234 Date: 2025-31-01
*
********************************************************************************/
const projectData = require("../data/projectData");
const sectorData = require("../data/sectorData");


let projects = [];


function initialize() {
    return new Promise((resolve, reject) => {
        try {
            projects = projectData.map((project) => {
                const sector = sectorData.find(sector => sector.id === project.sector_id);
                return {
                    ...project,
                    sector: sector ? sector.sector_name : "Unknown Sector"
                };
            });
            resolve();
        } catch (error) {
            reject("Failed to initialize projects data");
        }
    });
}


function getAllProjects() {
    return new Promise((resolve) => {
        resolve(projects);
    });
}


function getProjectById(projectId) {
    return new Promise((resolve, reject) => {
        const project = projects.find(proj => proj.id === projectId);
        if (project) {
            resolve(project);
        } else {
            reject(`Project with ID ${projectId} not found`);
        }
    });
}


function getProjectsBySector(sector) {
    return new Promise((resolve, reject) => {
        const filteredProjects = projects.filter(project =>
            project.sector.toLowerCase().includes(sector.toLowerCase())
        );
        if (filteredProjects.length > 0) {
            resolve(filteredProjects);
        } else {
            reject(`No projects found for sector: ${sector}`);
        }
    });
}

module.exports = { initialize, getAllProjects, getProjectById, getProjectsBySector };

initialize()
    .then(() => {
        console.log("Projects Initialized");

        
        getAllProjects().then(projects => console.log("All Projects:", projects));

        
        getProjectById(9)
            .then(project => console.log("Project by ID:", project))
            .catch(err => console.error(err));

        
        getProjectsBySector("electricity")
            .then(projects => console.log("Projects by Sector:", projects))
            .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
