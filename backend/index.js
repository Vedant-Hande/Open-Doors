// Keep index.js focused on starting the server
const app = require("./app");

const port = 8080;

app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
