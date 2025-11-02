// Keep index.js focused on starting the server
const app = require("./app");

const port = process.env.CONN_PORT;

app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
