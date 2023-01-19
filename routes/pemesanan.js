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
const pemesanan = model.pemesanan;

// get all data pemesanan
app.get("/getAllData", auth, async (req, res) => {
  await pemesanan
    .findAll({
      include: [
        {
          model: model.tipe_kamar,
          as: "tipe_kamar",
        },
        {
          model: model.user,
          as: "user",
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

// get data by id pemesanan
app.get("/getById/:id", auth, async (req, res) => {
  await pemesanan
    .findByPk(req.params.id, {
      include: [
        {
          model: model.tipe_kamar,
          as: "tipe_kamar",
        },
        {
          model: model.user,
          as: "user",
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

// create pemesanan
app.post("/create", async (req, res) => {
  const data = {
    nomor_pemesanan: "PMS AUL-" + Date.now(),
    nama_pemesan: req.body.nama_pemesan,
    email_pemesan: req.body.email_pemesan,
    tgl_check_in: req.body.tgl_check_in,
    tgl_check_out: req.body.tgl_check_out,
    nama_tamu: req.body.nama_tamu,
    jumlah_kamar: req.body.jumlah_kamar,
    id_tipe_kamar: req.body.id_tipe_kamar,
    id_user: req.body.id_user,
    status_pemesanan: req.body.status_pemesanan,
  };
  await pemesanan
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
});

// delete pemesanan
app.delete("/delete/:id_pemesanan", auth, async (req, res) => {
  const param = { id_pemesanan: req.params.id_pemesanan };

  // delete data
  pemesanan
    .destroy({ where: param })
    .then((result) => {
      if (result) {
        res.status(200).json({
          status: "success",
          message: "pemesanan has been deleted",
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

// edit pemesanan
app.patch("/edit/:id_pemesanan", auth, async (req, res) => {
  const param = { id_pemesanan: req.params.id_pemesanan };
  const data = {
    nama_pemesan: req.body.nama_pemesan,
    email_pemesan: req.body.email_pemesan,
    tgl_check_in: req.body.tgl_check_in,
    tgl_check_out: req.body.tgl_check_out,
    nama_tamu: req.body.nama_tamu,
    jumlah_kamar: req.body.jumlah_kamar,
    id_tipe_kamar: req.body.id_tipe_kamar,
    id_user: req.body.id_user,
    status_pemesanan: req.body.status_pemesanan,
  };

  pemesanan.findOne({ where: param }).then((result) => {
    if (result) {
      pemesanan
        .update(data, { where: param })
        .then((result) => {
          res.status(200).json({
            status: "success",
            message: "data has been updated",
            data: {
              id_pemesanan: param.id_pemesanan,
              nomor_kamar: data.nomor_kamar,
              id_tipe_kamar: data.id_tipe_kamar,
              nama_pemesan: data.nama_pemesan,
              email_pemesan: data.email_pemesan,
              tgl_check_in: data.tgl_check_in,
              tgl_check_out: data.tgl_check_out,
              nama_tamu: data.nama_tamu,
              jumlah_kamar: data.jumlah_kamar,
              id_tipe_kamar: data.id_tipe_kamar,
              id_user: data.id_user,
              status_pemesanan: data.status_pemesanan,
            },
          });
        })
        .catch((error) => {
          res.status(400).json({
            status: "error",
            message: error.message,
          });
        });
    } else {
      res.status(404).json({
        status: "error",
        message: "data not found",
      });
    }
  });
});

// search pemesanan
app.get("/search/:nama_tamu", auth, async (req, res) => {
  pemesanan
    .findAll({
      where: {
        [Op.or]: [
          {
            nama_tamu: {
              [Op.like]: "%" + req.params.nama_tamu + "%",
            },
          },
        ],
      },
      include: [
        {
          model: model.tipe_kamar,
          as: "tipe_kamar",
        },
        {
          model: model.user,
          as: "user",
        },
      ],
    })
    .then((result) => {
      res.status(200).json({
        status: "success",
        message: "result of nama tamu " + req.params.nama_tamu + "",
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

// filter pemesanan by check in
app.get("/filter/check_in/:tgl_check_in", auth, async (req, res) => {
  pemesanan
    .findAll({
      where: {
        tgl_check_in: req.params.tgl_check_in,
      },
      include: [
        {
          model: model.tipe_kamar,
          as: "tipe_kamar",
        },
        {
          model: model.user,
          as: "user",
        },
      ],
    })
    .then((result) => {
      res.status(200).json({
        status: "success",
        message: "result of tgl check in " + req.params.tgl_check_in + "",
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
