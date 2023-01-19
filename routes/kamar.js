//import library
const express = require("express");
const bodyParser = require("body-parser");
const { Op } = require("sequelize");
const auth = require("../auth");

//implementasi library
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//import model
const model = require("../models/index");
const kamar = model.kamar;

// get all data kamar
app.get("/getAllData", auth, async (req, res) => {
  await kamar
    .findAll({
      include: [
        {
          model: model.tipe_kamar,
          as: "tipe_kamar",
        },
      ],
    })
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

// get data by id kamar
app.get("/getById/:id", auth, async (req, res) => {
  await kamar
    .findByPk(req.params.id, {
      include: [
        {
          model: model.tipe_kamar,
          as: "tipe_kamar",
        },
      ],
    })
    .then((result) => {
      if (result) {
        res.status(200).json({
          status: "success",
          data: result,
        });
      } else {
        res.status(404).json({
          status: "error",
          message: "data not found",
        });
      }
    })
    .catch((error) => {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    });
});

// create kamar
app.post("/create", async (req, res) => {
  const data = {
    nomor_kamar: req.body.nomor_kamar,
    id_tipe_kamar: req.body.id_tipe_kamar,
  };
  await kamar
    .findOne({ where: { nomor_kamar: data.nomor_kamar } })
    .then((result) => {
      if (result) {
        res.status(400).json({
          status: "error",
          message: "nomor kamar already exist",
        });
      } else {
        kamar
          .create(data)
          .then((result) => {
            res.status(200).json({
              status: "success",
              message: "data has been inserted",
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

// delete kamar
app.delete("/delete/:id_kamar", auth, async (req, res) => {
  const param = { id_kamar: req.params.id_kamar };

  // delete data
  kamar
    .destroy({ where: param })
    .then((result) => {
      if (result) {
        res.status(200).json({
          status: "success",
          message: "room has been deleted",
          data: param,
        });
      } else {
        res.status(404).json({
          status: "error",
          message: "data not found",
        });
      }
    })
    .catch((error) => {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    });
});

// edit kamar
app.patch("/edit/:id_kamar", auth, async (req, res) => {
  const param = { id_kamar: req.params.id_kamar };
  const data = {
    nomor_kamar: req.body.nomor_kamar,
    id_tipe_kamar: req.body.id_tipe_kamar,
  };

  kamar.findOne({ where: param }).then((result) => {
    if (result) {
      kamar
        .findOne({ where: { nomor_kamar: data.nomor_kamar } })
        .then((result) => {
          if (result) {
            res.status(400).json({
              status: "error",
              message: "nomor kamar already exist",
            });
          } else {
            kamar
              .update(data, { where: param })
              .then((result) => {
                res.status(200).json({
                  status: "success",
                  message: "data has been updated",
                  data: {
                    id_kamar: param.id_kamar,
                    nomor_kamar: data.nomor_kamar,
                    id_tipe_kamar: data.id_tipe_kamar,
                  },
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
    } else {
      res.status(404).json({
        status: "error",
        message: "data not found",
      });
    }
  });
});

// search kamar
app.get("/search/:nomor_kamar", auth, async (req, res) => {
  kamar
    .findAll({
      where: {
        [Op.or]: [
          {
            nomor_kamar: {
              [Op.like]: "%" + req.params.nomor_kamar + "%",
            },
          },
        ],
      },
    })
    .then((result) => {
      res.status(200).json({
        status: "success",
        message: "result of nomor kamar " + req.params.nomor_kamar + "",
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
