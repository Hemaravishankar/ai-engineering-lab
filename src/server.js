const express = require("express");

const app = express();
app.use(express.json());

const books = [];
let nextId = 1;

function parsePositiveInteger(value) {
  if (typeof value !== "string") {
    return null;
  }
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }
  const num = Number(value);
  if (!Number.isSafeInteger(num) || num <= 0) {
    return null;
  }
  return num;
}

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
  let page = 1;
  let limit = 10;

  if (req.query.page !== undefined) {
    const parsedPage = parsePositiveInteger(req.query.page);
    if (parsedPage === null) {
      return res.status(400).json({
        error: "Invalid page parameter",
      });
    }
    page = parsedPage;
  }

  if (req.query.limit !== undefined) {
    const parsedLimit = parsePositiveInteger(req.query.limit);
    if (parsedLimit === null) {
      return res.status(400).json({
        error: "Invalid limit parameter",
      });
    }
    limit = parsedLimit;
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return res.json(books.slice(startIndex, endIndex));
});

if (require.main === module) {
  app.listen(3000, () => {
    console.log("Book API running at http://localhost:3000");
  });
}

module.exports = app;
