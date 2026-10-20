const express = require("express");

const app = express();
app.use(express.json());

const books = [];
let nextId = 1;

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/books", (req, res) => {
  const { title, author } = req.body || {};

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof author !== "string" ||
    !author.trim()
  ) {
    return res.status(400).json({
      error: "Title and author are required",
    });
  }

  const book = {
    id: nextId++,
    title: title.trim(),
    author: author.trim(),
  };

  books.push(book);
  return res.status(201).json(book);
});

app.get("/books", (req, res) => {
  res.json(books);
});
if (require.main === module) {
  app.listen(3000, () => {
    console.log("Book API running at http://localhost:3000");
  });
}

module.exports = app;