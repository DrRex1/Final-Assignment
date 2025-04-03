const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
require("dotenv").config();

let User;

// Mongoose Schema for user data
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true
  },
  password: String,
  email: String,
  loginHistory: [{
    dateTime: Date,
    userAgent: String
  }]
});

// Connect to MongoDB Atlas
module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(process.env.MONGODB);

    db.on("error", err => {
      reject(err);
    });

    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
};

// Register a new user
module.exports.registerUser = function (userData) {
  return new Promise((resolve, reject) => {
    if (userData.password !== userData.password2) {
      reject("Passwords do not match");
      return;
    }

    // Hash the password before saving
    bcrypt.hash(userData.password, 10)
      .then(hash => {
        const newUser = new User({
          userName: userData.userName,
          password: hash,
          email: userData.email,
          loginHistory: []
        });

        return newUser.save();
      })
      .then(() => resolve())
      .catch(err => {
        if (err.code === 11000) {
          reject("User Name already taken");
        } else {
          reject("There was an error creating the user: " + err);
        }
      })
      .catch(() => {
        reject("There was an error encrypting the password");
      });
  });
};

// Authenticate user credentials
module.exports.checkUser = function (userData) {
  return new Promise((resolve, reject) => {
    User.find({ userName: userData.userName })
      .then(users => {
        if (users.length === 0) {
          reject(`Unable to find user: ${userData.userName}`);
          return;
        }

        // Compare entered password with hashed password in DB
        bcrypt.compare(userData.password, users[0].password)
          .then(result => {
            if (!result) {
              reject(`Incorrect Password for user: ${userData.userName}`);
              return;
            }

            // Update login history (max 8 entries)
            if (users[0].loginHistory.length >= 8) {
              users[0].loginHistory.pop();
            }

            users[0].loginHistory.unshift({
              dateTime: new Date().toString(),
              userAgent: userData.userAgent
            });

            // Save updated login history
            User.updateOne(
              { userName: users[0].userName },
              { $set: { loginHistory: users[0].loginHistory } }
            )
              .then(() => resolve(users[0]))
              .catch(err => reject("There was an error verifying the user: " + err));
          })
          .catch(() => {
            reject("Error comparing passwords");
          });
      })
      .catch(() => {
        reject(`Unable to find user: ${userData.userName}`);
      });
  });
};
