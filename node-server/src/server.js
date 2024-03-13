const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const Schema = mongoose.Schema;

const app = express();
app.use(cookieParser());
const port = process.env.PORT || 3000;
const secret = "MySuperPrivateSecret";

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(
  cors({
    origin: "http://localhost:4200", // Adjust this to your Angular app's origin
    credentials: true, // Allow credentials (cookies)
  })
);

mongoose.connect("mongodb://127.0.0.1:27017/auto-insight");

app.use(bodyParser.json());

const newsArticleSchema = new mongoose.Schema({
  imgUrl: String,
  title: String,
  content: String,
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
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
  password: String,
  favorites: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "NewsArticle",
      },
    ],
    default: [],
  },
});

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
const User = mongoose.model("User", userSchema);

app.get("/api/news", async (req, res) => {
  const newsArticles = await NewsArticle.find();
  res.json(newsArticles);
});

// app.post("/api/news", async (req, res) => {
//   const newsArticle = new NewsArticle(req.body);
//   await newsArticle.save();
//   res.json(newsArticle);
// });

// app.post("/api/news", async (req, res) => {
//   try {
//     const authorizationHeader = req.headers.authorization;
//     if (!authorizationHeader) {
//       throw new Error("Authorization header is missing");
//     }

//     const token = authorizationHeader.split(" ")[1];
//     console.log(token);
//     if (!token) {
//       throw new Error("Invalid Authorization header format");
//     }

//     // Verify the token and extract user information
//     const decodedToken = jwt.verify(token, "MySuperPrivateSecret");
//     const ownerId = decodedToken.userId;

//     // Create a new news article with ownerId
//     const newsArticle = new NewsArticle({
//       ...req.body,
//       ownerId: ownerId,
//     });

//     // Save the news article to the database
//     await newsArticle.save();

//     res.json(newsArticle);
//   } catch (error) {
//     console.error("Error in creating news article:", error);
//     res.status(500).json({ error: "Error in creating news article", details: error.message });
//   }
// });

app.post("/api/news", async (req, res) => {
  try {
    const tokenCookie = req.cookies.jwt;

    if (!tokenCookie) {
      throw new Error("Cookie is missing");
    }
    // Verify the token and extract user information
    const decodedToken = jwt.verify(tokenCookie, "MySuperPrivateSecret");
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
    res.status(500).json({
      error: "Error in creating news article",
      details: error.message,
    });
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
    res
      .status(500)
      .json({ error: "Error in registration", details: error.message });
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
});

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

    const payload = {
      username: user.username,
      email: user.email,
      userId: user._id,
    };
    const options = { expiresIn: "2d" };

    const token = jwt.sign(payload, secret, options);
    // res.cookie('jwt', token);

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error in login:", error);
    res
      .status(401)
      .json({ error: "Authentication failed", details: error.message });
  }
});

app.post("/api/logout", async (req, res) => {
  try {
    // Clear user session data
    req.session.destroy(() => {
      res.clearCookie("jwt");
      res.status(200).json({ message: "Logout successful" });
    });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ error: "Error in logout", details: error.message });
  }
});

app.get("/api/get-token", async (req, res) => {
  const tokenCookie = req.cookies.jwt;

  // console.log('Received request to /api/get-token. Token Cookie:', tokenCookie);

  if (!tokenCookie) {
    console.log("Token not found. Sending 401 Unauthorized response.");
    return res.status(401).json({ message: "Token not found" });
  }

  try {
    // console.log('Attempting to verify and decode the token...');
    const decodedToken = jwt.verify(tokenCookie, secret);

    // Extract relevant information if needed
    // console.log('Token verification successful. Decoded Token:', decodedToken);

    res.json({ decodedToken });
  } catch (error) {
    console.error("Token Verification Error:", error);
    console.log(
      "Sending 401 Unauthorized response due to token verification error."
    );
    res.status(401).json({ message: "Invalid token" });
  }
});

app.get("/api/get-user-data", async (req, res) => {
  const tokenCookie = req.cookies.jwt;

  if (!tokenCookie) {
    return res.status(401).json({ message: "Token not found" });
  }

  try {
    // Verify and decode the JWT token
    const decodedToken = jwt.verify(tokenCookie, secret);

    // You can now use the decoded token data
    res.json({ username: decodedToken.username, email: decodedToken.email });
  } catch (error) {
    // Handle token verification errors
    res.status(401).json({ message: "Invalid token" });
  }
});

app.get("/api/news/details/:id", async (req, res) => {
  try {
    const articleId = req.params.id;
    const newsArticle = await NewsArticle.findById(articleId);

    if (!newsArticle) {
      res.status(404).send("Article not found");
      return;
    }

    const tokenCookie = req.cookies.jwt;

    if (tokenCookie) {
      const isAuthenticated = true;
      const decodedToken = jwt.verify(tokenCookie, secret);

      const isAuthorized =
        newsArticle.ownerId &&
        newsArticle.ownerId.toString() === decodedToken.userId;

      const user = await User.findById(decodedToken.userId);
      const isFavoredByUser = user.favorites.some((favArticleId) => favArticleId.toString() === articleId);  
      
      return res.json({ newsArticle, isAuthorized, isAuthenticated, isFavoredByUser });
    }

    res.json({ newsArticle });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching article details");
  }
});

app.post("/api/news/favorites/:id", async (req, res) => {
  try {
    const articleId = req.params.id;
    const tokenCookie = req.cookies.jwt;
    const decodedToken = jwt.verify(tokenCookie, secret);
    const user = await User.findById(decodedToken.userId);
    const favoritesArray = user.favorites;
    favoritesArray.push(articleId);
    await user.save();
    res.json({articleId})
  } catch (error) {
    res.status(500).json({ error: "Error adding article to favorites", details: error.message });
  }
});

app.get("/api/news/favorites", async (req, res) => {
  try {
    const tokenCookie = req.cookies.jwt;
    const decodedToken = jwt.verify(tokenCookie, secret)
    const user = await User.findById(decodedToken.userId);
    const favoritesArray = user.favorites;
    const articles = await NewsArticle.find({
      _id: { $in: favoritesArray }
    });

    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching favorite articles", details: error.message });
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
