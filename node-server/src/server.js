const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const app = express();
const port = process.env.PORT || 3000;

app.use(cors())

mongoose.connect("mongodb://127.0.0.1:27017/auto-insight");

app.use(bodyParser.json());

const newsArticleSchema = new mongoose.Schema({
  imgUrl: String,
  title: String,
  content: String,
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: String
})

userSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(user.password, salt);

    user.password = hashedPassword;

    next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const NewsArticle = mongoose.model("NewsArticle", newsArticleSchema);
const User = mongoose.model("User", userSchema)

app.get("/api/news", async (req, res) => {
  const newsArticles = await NewsArticle.find();
  res.json(newsArticles);
});

// app.post("/api/news", async (req, res) => {
//   const newsArticle = new NewsArticle(req.body);
//   await newsArticle.save();
//   res.json(newsArticle);
// });

app.post("/api/news", async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      throw new Error("Authorization header is missing");
    }

    const token = authorizationHeader.split(" ")[1];
    console.log(token);
    if (!token) {
      throw new Error("Invalid Authorization header format");
    }
    
    // Verify the token and extract user information
    const decodedToken = jwt.verify(token, "MySuperPrivateSecret");
    const ownerId = decodedToken.userId;

    // Create a new news article with ownerId
    const newsArticle = new NewsArticle({
      ...req.body,
      ownerId: ownerId,
    });

    // Save the news article to the database
    await newsArticle.save();

    res.json(newsArticle);
  } catch (error) {
    console.error("Error in creating news article:", error);
    res.status(500).json({ error: "Error in creating news article", details: error.message });
  }
});


app.post("/api/register", async (req, res) => {
  try {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });

    await newUser.save();

    res.json(newUser);
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ error: "Error in registration", details: error.message });
    // let errors = [];

    // if (error.code === 11000) {
    //   errors.push("username already in use!");
    //   return res.render("register", { errors, layout: "main" });
    // }

    // if (error.name === "ValidationError") {
    //   errors = Object.values(error.errors).map((err) => err.message);

    //   return res.render("register", { errors, userData, layout: "main" });
    // }
  }
})

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      throw new Error("Username and password are required!");
    }

    const user = await User.findOne({ username });

    if (!user) {
      throw new Error("Invalid username!");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error("Invalid password!");
    }

    const payload = { username: user.username, email: user.email, userId: user._id };
    const options = { expiresIn: "2d" };
    const secret = "MySuperPrivateSecret";
    const token = jwt.sign(payload, secret, options);

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(401).json({ error: "Authentication failed", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
