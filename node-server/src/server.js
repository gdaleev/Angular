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
  imgUrl: {
    type: String,
    required: [true, "Image URL is required!"],
    match: [
      /^https?:\/\/.*\.(?:png|jpg|gif|jpeg)$/,
      "Please provide a valid image URL!",
    ],
  },
  title: {
    type: String,
    required: [true, "Title is required!"],
    minlength: [5, "Title must be at least 5 characters long!"],
  },
  content: {
    type: String,
    required: [true, "Content is required!"],
    minlength: [20, "Content must be at least 20 characters long!"],
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Owner ID is required"],
  },
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required!"],
    minlength: [4, "Username should be at least 4 characters long!"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required!"],
    minlength: [10, "Email should be at least 10 characters long!"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required!"],
    minlength: [4, "Password should be at least 4 characters long!"],
  },
  confirmPassword: {
    type: String,
    required: [true, "Repeat password is required!"],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: "Passwords do not match!",
    },
    select: false,
  },
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

userSchema.pre("save", function (next) {
  this.confirmPassword = undefined;
  next();
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
      return res.status(401).json({ error: "Token not found" });
    }

    try {
      const decodedToken = jwt.verify(tokenCookie, secret);
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTimestamp) {
        return res.status(401).json({ error: "Token expired" });
      }

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
      if (error.name === "TokenExpiredError") {
        // Token has expired
        return res.status(401).json({ error: "Token expired" });
      } else if (error.name === "ValidationError") {
        // Mongoose validation error
        const validationErrors = Object.values(error.errors).map(
          (err) => err.message
        );
        return res.status(400).json({ error: validationErrors });
      } else {
        // Other token verification or database errors
        console.error("Error creating news article:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  } catch (error) {
    console.error("Error creating news article:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.rePassword,
    });

    await newUser.save();

    res.json(newUser);
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern.username) {
        return res.status(400).json({ error: "Username already taken" });
      } else if (error.keyPattern.email) {
        return res.status(400).json({ error: "Email already registered" });
      } else {
        return res.status(400).json({ error: "Duplicate key error" });
      }
    } else if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({ error: validationErrors });
    } else {
    }
    console.error("Error in registration:", error);
    res
      .status(500)
      .json({ error: "Error in registration", details: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username) {
      return res.status(400).json({ error: "Username is required!" });
    }

    if (!password) {
      return res.status(400).json({ error: "Password is required!" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: "Invalid username!" });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid password!" });
    }

    const payload = {
      username: user.username,
      email: user.email,
      userId: user._id,
    };

    const options = { expiresIn: "2d" };
    // const options = { expiresIn: "10s" };

    const token = jwt.sign(payload, secret, options);

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ error: "Internal server error" });
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
  const isInitialLoad = req.headers["initial-load"] === "true";

  if (!tokenCookie) {
    console.log("Token not found.");
    if (isInitialLoad) {
      console.log("Initial load: Token not found.");
      return res.json({ message: "Token not found during initial load" });
    } else {
      console.log("Sending 401 Unauthorized response.");
      return res.status(401).json({ message: "Token not found" });
    }
  }

  try {
    const decodedToken = jwt.verify(tokenCookie, secret);
    res.json({ decodedToken });
  } catch (error) {
    console.error("Token Verification Error:", error);
    console.log(
      "Sending 401 Unauthorized response due to token verification error."
    );
    res.status(401).json({ message: "Invalid token" });
  }
});

// app.get("/api/get-token", async (req, res) => {
//   const tokenCookie = req.cookies.jwt;

//   // console.log('Received request to /api/get-token. Token Cookie:', tokenCookie);

//   if (!tokenCookie) {
//     console.log("Token not found. Sending 401 Unauthorized response.");
//     return res.status(401).json({ message: "Token not found" });
//   }

//   try {
//     // console.log('Attempting to verify and decode the token...');
//     const decodedToken = jwt.verify(tokenCookie, secret);

//     // Extract relevant information if needed
//     // console.log('Token verification successful. Decoded Token:', decodedToken);

//     res.json({ decodedToken });
//   } catch (error) {
//     console.error("Token Verification Error:", error);
//     console.log(
//       "Sending 401 Unauthorized response due to token verification error."
//     );
//     res.status(401).json({ message: "Invalid token" });
//   }
// });

app.get("/api/get-user-data", async (req, res) => {
  try {
    const tokenCookie = req.cookies.jwt;

    if (!tokenCookie) {
      return res.status(401).json({ message: "Token not found" });
    }

    try {
      // Verify and decode the JWT token
      const decodedToken = jwt.verify(tokenCookie, secret);
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTimestamp) {
        return res.status(401).json({ error: "Token expired" });
      }
      // You can now use the decoded token data
      res.json({ username: decodedToken.username, email: decodedToken.email });
    } catch (error) {
      // Handle token verification errors
      if (error.name === "TokenExpiredError") {
        // Token has expired
        return res.status(401).json({ error: "Token expired" });
      } else {
        // Other token verification errors
        console.error("Error verifying token:", error);
        return res.status(401).json({ error: "Invalid token" });
      }
    }
  } catch (error) {
    console.error("Error retrieving news article:", error);
    res.status(500).json({ error: "Internal server error" });
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
      const isFavoredByUser = user.favorites.some(
        (favArticleId) => favArticleId.toString() === articleId
      );

      return res.json({
        newsArticle,
        isAuthorized,
        isAuthenticated,
        isFavoredByUser,
      });
    }

    res.json({ newsArticle });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      // Token has expired, send 401 Unauthorized response
      res.status(401).json({ error: "Token expired" });
    } else {
      // Other token verification errors
      console.error("Error verifying token:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

app.post("/api/news/favorites/:id", async (req, res) => {
  try {
    const articleId = req.params.id;
    const tokenCookie = req.cookies.jwt;

    if (!tokenCookie) {
      return res.status(401).json({ error: "Token not found" });
    }

    try {
      const decodedToken = jwt.verify(tokenCookie, secret);
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTimestamp) {
        return res.status(401).json({ error: "Token expired" });
      }
      const user = await User.findById(decodedToken.userId);
      const favoritesArray = user.favorites;
      favoritesArray.push(articleId);
      await user.save();
      res.json({ articleId });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        // Token has expired
        return res.status(401).json({ error: "Token expired" });
      } else {
        // Other token verification errors
        console.error("Error verifying token:", error);
        return res.status(401).json({ error: "Invalid token" });
      }
    }
  } catch (error) {
    console.error("Error retrieving news article:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/news/favorites", async (req, res) => {
  try {
    const tokenCookie = req.cookies.jwt;
    if (!tokenCookie) {
      return res.status(401).json({ error: "Token not found" });
    }

    try {
      const decodedToken = jwt.verify(tokenCookie, secret);
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTimestamp) {
        return res.status(401).json({ error: "Token expired" });
      }
      const user = await User.findById(decodedToken.userId);
      const favoritesArray = user.favorites;
      const articles = await NewsArticle.find({
        _id: { $in: favoritesArray },
      });

      res.json(articles);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        // Token has expired
        return res.status(401).json({ error: "Token expired" });
      } else {
        // Other token verification errors
        console.error("Error verifying token:", error);
        return res.status(401).json({ error: "Invalid token" });
      }
    }
  } catch (error) {
    console.error("Error retrieving news article:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/news/edit/:id", async (req, res) => {
  try {
    const articleId = req.params.id;
    const tokenCookie = req.cookies.jwt;

    // Check if token is present
    if (!tokenCookie) {
      return res.status(401).json({ error: "Token not found" });
    }

    try {
      // Verify the token
      const decodedToken = jwt.verify(tokenCookie, secret);

      // You might also want to check if the token has expired
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTimestamp) {
        return res.status(401).json({ error: "Token expired" });
      }

      // Token is valid, continue processing
      const newsArticle = await NewsArticle.findById(articleId);
      res.json({ newsArticle });
    } catch (error) {
      // Token verification failed
      if (error.name === "TokenExpiredError") {
        // Token has expired
        return res.status(401).json({ error: "Token expired" });
      } else {
        // Other token verification errors
        console.error("Error verifying token:", error);
        return res.status(401).json({ error: "Invalid token" });
      }
    }
  } catch (error) {
    // Other server-side errors
    console.error("Error retrieving news article:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/news/edit/:id", async (req, res) => {
  try {
    const articleId = req.params.id;
    const tokenCookie = req.cookies.jwt;

    if (!tokenCookie) {
      return res.status(401).json({ error: "Token not found" });
    }

    const decodedToken = jwt.verify(tokenCookie, secret);
    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (decodedToken.exp < currentTimestamp) {
      return res.status(401).json({ error: "Token expired" });
    }

    const formData = req.body;

    const newsArticle = await NewsArticle.findByIdAndUpdate(
      articleId,
      formData,
      { new: true, runValidators: true } // To ensure Mongoose validators are run
    );

    res.json({ success: true, newsArticle });
  } catch (error) {
    console.error("Error updating news article:", error);
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({ error: validationErrors });
    }
    res
      .status(500)
      .json({ error: "Failed to update news article. Please try again." });
  }
});

app.delete("/api/news/delete/:id", async (req, res) => {
  try {
    const articleId = req.params.id;
    const tokenCookie = req.cookies.jwt;

    // Check if token is present
    if (!tokenCookie) {
      return res.status(401).json({ error: "Token not found" });
    }

    try {
      const decodedToken = jwt.verify(tokenCookie, secret);

      // You might also want to check if the token has expired
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTimestamp) {
        return res.status(401).json({ error: "Token expired" });
      }

      const deletedArticle = await NewsArticle.findByIdAndDelete(articleId);
      await User.updateMany(
        { favorites: articleId },
        { $pull: { favorites: articleId } }
      );
      res.json({ success: true, deletedArticle });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        // Token has expired, send 401 Unauthorized response
        res.status(401).json({ error: "Token expired" });
      } else {
        // Other token verification errors
        console.error("Error verifying token:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  } catch (error) {
    console.error("Error retrieving news article:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
