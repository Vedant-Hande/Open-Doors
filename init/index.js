const mongoose = require("mongoose");
const listing = require("../models/listing");
const initData = require("./data");

async function main() {
  await mongoose.connect("mongodb://localhost:27017/OpenDoors");
}

main()
  .then((result) => {
    console.log("connected to mongoDB");
  })
  .catch((err) => {
    console.log("error connecting to mongoDB", err);
  });

const initDB = async () => {
  await listing.deleteMany({});
  await listing.insertMany(initData.data);
  console.log("data is saved");
};

initDB();
