//import library
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const auth = require("../auth");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "UKKcyangpalingcantik";

//implementasi library
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//import model
const model = require("../models/index");
const user = model.user;

//import multer
const multer = require("multer");
const path = require("path");
const fs = require("fs");

//config storage image
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/user");
  },
  filename: (req, file, cb) => {
    cb(null, "img-" + Date.now() + path.extname(file.originalname));
  },
});
let upload = multer({ storage: storage });

// get all data user
app.get("/getAllData", auth, async (req, res) => {
  await user
    .findAll()
    .then((result) => {
      res.status(200).json({
        status: "success",
        data: result,
      });
    })
    .catch((error) => {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    });
});

// get data by id user
app.get("/getById/:id", auth, async (req, res) => {
  await user
    .findByPk(req.params.id)
    .then((result) => {
      res.status(200).json({
        status: "success",
        data: result,
      });
    })
    .catch((error) => {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    });
});

// register
app.post("/register", upload.single("foto"), async (req, res) => {
  const data = {
    nama_user: req.body.nama_user,
    password: bcrypt.hashSync(req.body.password, 10),
    email: req.body.email,
    role: req.body.role,
    foto: req.file.filename,
    resultArr: {},
  };
  await user
    .findAll({
      where: {
        [Op.or]: [{ email: data.email }],
      },
    })
    .then((result) => {
      resultArr = result;
      if (resultArr.length > 0) {
        res.status(400).json({
          status: "error",
          message: "email already exist",
        });
      } else {
        user
          .create(data)
          .then((result) => {
            res.status(200).json({
              status: "success",
              message: "user has been registered",
              data: result,
            });
          })
          .catch((error) => {
            res.status(400).json({
              status: "error",
              message: error.message,
            });
          });
      }
    });
});

// login
app.post("/login", async (req, res) => {
  const data = await user.findOne({ where: { email: req.body.email } });

  if (data) {
    const validPassword = await bcrypt.compare(
      req.body.password,
      data.password
    );
    if (validPassword) {
      let payload = JSON.stringify(data);
      // generate token
      let token = jwt.sign(payload, SECRET_KEY);
      res.status(200).json({
        status: "success",
        logged: true,
        message: "valid password",
        token: token,
        data: data,
      });
    } else {
      res.status(400).json({
        status: "error",
        message: "invalid Password",
      });
    }
  } else {
    res.status(400).json({
      status: "error",
      message: "user does not exist",
    });
  }
});

// delete user
app.delete("/delete/:id_user", auth, async (req, res) => {
  const param = { id_user: req.params.id_user };
  // delete old file
  user.findOne({ where: param }).then((result) => {
    let oldFileName = result.dataValues.foto;
    // delete old file
    let dir = path.join(__dirname, "../public/images/user/", oldFileName);
    fs.unlink(dir, (err) => err);
  });

  // delete data
  user
    .destroy({ where: param })
    .then((result) => {
      res.json({
        status: "success",
        message: "user has been deleted",
        data: param,
      });
    })
    .catch((error) => {
      res.json({
        status: "error",
        message: error.message,
      });
    });
});

// edit user
app.patch("/edit/:id_user", auth, upload.single("foto"), async (req, res) => {
  const param = { id_user: req.params.id_user };
  const data = {
    nama_user: req.body.nama_user,
    password: req.body.password,
    email: req.body.email,
    role: req.body.role,
    resultArr: {},
  };

  // delete old file
  if (req.file) {
    // get data by id
    user.findOne({ where: param }).then((result) => {
      let oldFileName = result.foto;
      // delete old file
      let dir = path.join(__dirname, "../public/images/user/", oldFileName);
      fs.unlink(dir, (err) => err);
    });
    // set new filename
    data.foto = req.file.filename;
  }

  // check if password is empty
  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);
  }

  if (data.email) {
    user
      .findAll({
        where: {
          [Op.or]: [{ email: data.email }],
        },
      })
      .then((result) => {
        resultArr = result;
        if (resultArr.length > 0) {
          res.status(400).json({
            status: "error",
            message: "email already exist",
          });
        }
      });
  }
  user
    .update(data, { where: param })
    .then((result) => {
      res.status(200).json({
        status: "success",
        message: "user has been updated",
        data: {
          id_user: param.id_user,
          nama_user: data.nama_user,
          email: data.email,
          role: data.role,
          foto: data.foto,
        },
      });
    })
    .catch((error) => {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    });
});

// search user
app.get("/search/:nama_user", auth, async (req, res) => {
  user
    .findAll({
      where: {
        [Op.or]: [
          { nama_user: { [Op.like]: "%" + req.params.nama_user + "%" } },
        ],
      },
    })
    .then((result) => {
      res.status(200).json({
        status: "success",
        message: "user has been found",
        data: result,
      });
    })
    .catch((error) => {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    });
});

module.exports = app;
