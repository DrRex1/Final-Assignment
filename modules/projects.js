/********************************************************************************
*  WEB322 – Assignment 05
*  
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
*  
*  Name: Vishavjeet Khatri Student ID: 150215234 Date: 2025-03-23
********************************************************************************/

require('dotenv').config();
require('pg');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.PG_CONNECTION_STRING, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false }
    }
});

// Define Sector Model (no pluralization)
const Sector = sequelize.define('Sector', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sector_name: Sequelize.STRING
}, {
    createdAt: false,
    updatedAt: false,
    freezeTableName: true
});

// Define Project Model (no pluralization)
const Project = sequelize.define('Project', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: Sequelize.STRING,
    feature_img_url: Sequelize.STRING,
    summary_short: Sequelize.TEXT,
    intro_short: Sequelize.TEXT,
    impact: Sequelize.TEXT,
    original_source_url: Sequelize.STRING,
    sector_id: Sequelize.INTEGER
}, {
    createdAt: false,
    updatedAt: false,
    freezeTableName: true
});

// Define association
Project.belongsTo(Sector, { foreignKey: 'sector_id' });

// DB Initialization
function initialize() {
    return sequelize.sync();
}

// CRUD Functions
function getAllProjects() {
    return Project.findAll({ include: [Sector] });
}

function getProjectById(projectId) {
    return Project.findAll({
        include: [Sector],
        where: { id: projectId }
    }).then(data => {
        if (data.length > 0) return data[0];
        throw new Error("Unable to find requested project");
    });
}

function getProjectsBySector(sector) {
    return Project.findAll({
        include: [Sector],
        where: {
            '$Sector.sector_name$': {
                [Sequelize.Op.iLike]: `%${sector}%`
            }
        }
    }).then(data => {
        if (data.length > 0) return data;
        throw new Error("Unable to find requested projects");
    });
}

// Additional functions (Add/Edit/Delete)
function addProject(projectData) {
    return Project.create(projectData);
}

function getAllSectors() {
    return Sector.findAll();
}

function editProject(id, projectData) {
    return Project.update(projectData, { where: { id } });
}

function deleteProject(id) {
    return Project.destroy({ where: { id } });
}

// Export all functions
module.exports = {
    initialize,
    getAllProjects,
    getProjectById,
    getProjectsBySector,
    addProject,
    getAllSectors,
    editProject,
    deleteProject
};

