const express = require("express");
const authCheck = require("../Middleware/authCheck");

const scansController = require("../controllers/scans-controllers");

const router = express.Router();

router.post("/submitscans", authCheck, async (req, res) => {
  try {
    let response = await scansController.submitScans(req.body);
    //console.log(response);
    res.json(response);
  } catch (err) {
    console.log(err);
  }
});
router.post("/getmyscans", authCheck, async (req, res) => {
  try {
    let response = await scansController.getMyScans(req.body);
    //console.log(response);
    res.json(response);
  } catch (err) {
    console.log(err);
  }
});
router.post("/getallscans", authCheck, async (req, res) => {
  try {
    let response = await scansController.getAllScans(req.body);
    //console.log(response);
    res.json(response);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
