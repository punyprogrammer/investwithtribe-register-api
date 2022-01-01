const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
  try {

      //check  whether username is  taken
      if(await User.findOne({username:req.body.username}))
      {
        throw 'Username ' +req.body.username+' is already taken';
      }
      if(await User.findOne({email:req.body.email}))
      {
        throw 'An account with this email id already exists ';
      }
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const newUser = await new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPass,
    });
    const user = await newUser.save();
    const { password, ...others } = user._doc;
    res.status(200).json({ data: others, msg: "Registration Successful!!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({errMsg:err});
  }
});

//route to send email
router.post("/email", async (req, res) => {
  let transporter = nodemailer.createTransport({
   service:"gmail",
    secure: false, // true for 465, false for other ports
    auth: {
      user: "dummyganguly@gmail.com", // generated ethereal user
      pass: process.env.SENDER_PASS, // generated ethereal password
    },
  });
  try {
    let info = await transporter.sendMail({
      from: "dummyganguly@gmail.com", // sender address
      to: req.body.email, // list of receivers
      subject: "Welcome to InvestWithTribe", // Subject line
      text: `Hi ${req.body.username} ,thanks for joining Invest With Tribe we promise you the best services you can think of!!`, // plain text body
    });
    res.status(200).json(info);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
