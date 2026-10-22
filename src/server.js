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
  const { page, limit } = req.query;


  
  const isPositiveInteger = (val) => {
    if (typeof val === "number") {
      return Number.isInteger(val) && val > 0;
    }
    if (typeof val !== "string") return false;
    const trimmed = val.trim();
    if (!/^\d+$/.test(trimmed)) return false;
    const num = Number(trimmed);
    return num > 0 && Number.isSafeInteger(num);
  };

  if (page !== undefined && !isPositiveInteger(page)) {
    return res.status(400).json({
      error: "Page must be a positive integer",
    });
  }

  if (limit !== undefined && !isPositiveInteger(limit)) {
    return res.status(400).json({
      error: "Limit must be a positive integer",
    });
  }

  const pageNum = page !== undefined ? parseInt(page, 10) : 1;
  const limitNum = limit !== undefined ? parseInt(limit, 10) : 10;

  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;

  return res.json(books.slice(startIndex, endIndex));
});

if (require.main === module) {
  app.listen(3000, () => {
    console.log("Book API running at http://localhost:3000");
  });
}

module.exports = app;
