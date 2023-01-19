//import
const express = require("express");
const cors = require("cors");
const path = require("path");

// variable
const PORT = process.env.PORT || 8080;

//implementasi
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// endpoint user
const user = require("./routes/user");
app.use("/user", user);

//run server
app.listen(PORT, () => {
  console.log("server run on port " + PORT);
});
