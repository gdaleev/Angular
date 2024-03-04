const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require('cors')

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

const NewsArticle = mongoose.model("NewsArticle", newsArticleSchema);

app.get("/api/news", async (req, res) => {
  const newsArticles = await NewsArticle.find();
  res.json(newsArticles);
});

app.post("/api/news", async (req, res) => {
  const newsArticle = new NewsArticle(req.body);
  await newsArticle.save();
  res.json(newsArticle);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
