const GoogleStrategy = require('passport-google-oauth2').Strategy;
require('dotenv').config();
const passport = require('passport');
const { UserModel } = require('../models/userModel.model');
const { v4: uuidv4 } = require('uuid');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'https://stylehub-vb4k.onrender.com/auth/google/callback',
            passReqToCallback: true,
        },
        async function (request, accessToken, refreshToken, profile, done) {
            try {
                let email = profile._json.email;
                let firstName = profile._json.given_name;
                let lastName = profile._json.family_name;
                let picture = profile._json.picture;

                // Check if the user already exists in your database
                const existingUser = await UserModel.findOne({ email });

                if (existingUser) {
                    return done(null, existingUser); // Existing user, return without error
                } else {
                    // Create a new user and save it to the database
                    const user = new UserModel({
                        email,
                        password: uuidv4(),
                        firstName,
                        lastName,
                        picture,
                    });

                    await user.save();

                    return done(null, user); // New user created
                }
            } catch (error) {
                return done(error, false); // Handle errors
            }
        }
    )
);

module.exports = {
    passport,
};

