const MongoStore = require("connect-mongo");

const sessionConfig = {
  secret: process.env.SESSION_SECRET || "mysecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || "mongodb://localhost:27017/TripSpot",
    collectionName: "sessions",
    ttl: 5 * 24 * 60 * 60,
  }),
};

module.exports = sessionConfig;
