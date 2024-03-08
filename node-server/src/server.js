const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require('cors')
const jwt = require('jsonwebtoken')

const app = express();
const port = process.env.PORT || 3000;

app.use(cors())

mongoose.connect("mongodb://127.0.0.1:27017/auto-insight");

app.use(bodyParser.json());

const newsArticleSchema = new mongoose.Schema({
  imgUrl: String,
  title: String,
  content: String,
});

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
})

const NewsArticle = mongoose.model("NewsArticle", newsArticleSchema);
const User = mongoose.model("User", userSchema)

app.get("/api/news", async (req, res) => {
  const newsArticles = await NewsArticle.find();
  res.json(newsArticles);
});

app.post("/api/news", async (req, res) => {
  const newsArticle = new NewsArticle(req.body);
  await newsArticle.save();
  res.json(newsArticle);
});

app.post("/api/register", async (req, res) => {
  try {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });

    const payloads = { username: newUser.username, email: newUser.email, userId: newUser._id };
    const options = { expiresIn: "2d" };
    const secret = "MySuperPrivateSecret";
    const token = jwt.sign(payloads, secret, options);

    res.cookie("jwt", token, {
      httpOnly: false,
      sameSite: "None",
      secure: true,
      maxAge: 2 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    await newUser.save();

    res.json(newUser);
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ error: "Error in registration", details: error.message });
    // let errors = [];

    // if (error.code === 11000) {
    //   errors.push("Email already in use!");
    //   return res.render("register", { errors, layout: "main" });
    // }

    // if (error.name === "ValidationError") {
    //   errors = Object.values(error.errors).map((err) => err.message);

    //   return res.render("register", { errors, userData, layout: "main" });
    // }
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
