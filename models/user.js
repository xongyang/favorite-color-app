// This file holds the mongoose user model

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    local: {
       username: String,
       password: String
    },

    twitter: { // holds twitter id, token, display name, and username
        id: String,
        token: String,
        displayName: String,
        username: String
    },

    signupDate: {
        type: Date,
        default: Date.now()
    },

    favorites: {
       color: String,
       luckyNumber: Number
    }
});

userSchema.methods.generateHash = function(password) {
    // Create a hash of the plaintext password
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

userSchema.methods.validPassword = function(password) {
    // Verify if password entered matches by creating a
    // hash of the password entered and compare it to the stored hash password
    return bcrypt.compareSync(password, this.local.password);

};

User = mongoose.model("User", userSchema);

module.exports = User;