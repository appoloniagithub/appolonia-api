const express = require("express");
const authCheck = require("../Middleware/authCheck");

const chatController = require("../controllers/chat-controllers");

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
    folder: "CHAT",
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

router.post("/newchat", async (req, res) => {
  try {
    let response = await chatController.newChat(req.body);
    //console.log(response);
    res.json(response);
  } catch (err) {
    console.log(err);
  }
});
router.post("/getconversations", authCheck, chatController.getConversations);
router.post(
  "/getconversationmessages",
  authCheck,
  chatController.getConversationMessages
);
router.post("/newmessage", authCheck, async (req, res) => {
  try {
    let response = await chatController.newMessage(req.body);
    //console.log(response);
    res.json(response);
  } catch (err) {
    console.log(err);
  }
});

router.post(
  "/newmessageimage",
  [authCheck, upload.array("message")],
  async (req, res) => {
    try {
      let response = await chatController.newMessage(req.body);
      //console.log(response);
      res.json(response);
    } catch (err) {
      console.log(err);
    }
  }
);

module.exports = router;
