const mongoose = require("mongoose");
const listing = require("../models/listing");
const initData = require("./data");

async function main() {
  await mongoose.connect("mongodb://localhost:27017/TripSpot");
}

main()
  .then((result) => {
    console.log("connected to mongoDB");
  })
  .catch((err) => {
    console.log("error connecting to mongoDB", err);
  });

const initDB = async () => {
  try {
    await listing.deleteMany({});
    const dataWithOwner = initData.data.map((obj) => ({
      ...obj,
      owner: "671e69197480770415b5070a",
    }));
    await listing.insertMany(dataWithOwner);
    console.log("data is saved");
  } catch (err) {
    console.log("error saving data", err);
  }
};

initDB();
