const express = require("express");
const authCheck = require("../Middleware/authCheck");

const scansController = require("../controllers/scans-controllers");

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: "dbff6tzuo",
  api_key: "376437619835514",
  api_secret: "Jz-U91pJTdFnbWN4X6Lx3fj6pC4",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "SCANS",
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

router.post(
  "/submitscans",
  [authCheck, upload.any("faceScanImages", "teethScanImages")],
  scansController.submitScans
);

router.post("/getmyscans", authCheck, scansController.getMyScans);
router.post("/getallscans", authCheck, scansController.getAllScans);

module.exports = router;
