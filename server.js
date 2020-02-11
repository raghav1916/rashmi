const express = require("express");
const fs = require("fs");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotalySecretKey");
const dbconnect = require("./config");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.all("/*", function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Content-Type, Authorization, Content-Length, X-Requested-With"
//   );
//   next();
// });

app.use(express.static("public"));

app.post("/login", function(req, res) {
  console.log(req.body);
  var userName = req.body.userName;
  var password = req.body.password;
  dbconnect.query("SELECT * FROM signup WHERE email = ?", [userName], function(
    err,
    results,
    fields
  ) {
    if (err) {
      console.log("Login error - ", err);
      res.json({
        status: false,
        message: "Incorrect query"
      });
    } else {
      if (results.length > 0) {
        console.log("Results - ", JSON.stringify(results));
        decryptedString = cryptr.decrypt(results[0].pwd);
        if (password == decryptedString) {
          var obj = {
            message: "User Authenticated - Successfull",
            fullName: results[0].firstName + results[0].lastName,
            email: results[0].email
          };
          const html = fs.readFileSync(__dirname + "/public/finalDetails.html");
          res.json({ html: html.toString(), data: obj });
          // res.json({
          //   message: "User Authenticated - Successfull",
          //   fullName: results[0].firstName + results[0].lastName,
          //   email: results[0].email
          // });
        } else {
          res.json({
            status: false,
            message: "User Authenticated - Failed"
          });
        }
      } else {
        res.json({
          status: false,
          message: "Email does not exits"
        });
      }
    }
  });

  // res.send("Data received");
});

app.post("/signup", function(req, res) {
  console.log(req.body);
  var encryptedString = cryptr.encrypt(req.body.password);
  var userDetails = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    pwd: encryptedString
  };
  dbconnect.query("INSERT INTO signup SET ?", userDetails, function(
    err,
    results,
    fields
  ) {
    if (err) {
      console.log("Signupp err is - ", err);
      res.json({
        status: false,
        message: "Incorrect query"
      });
    } else {
      res.sendFile(__dirname + "/public" + "/index.html");
      //});
    }
  });
  // res.send("Register data received");
});

app.listen(port, () => {
  console.log(`Server listening to ${port}`);
});
