import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  host: "localhost",
  user: "postgres",
  password: "FORD",
  database: "BookNotes",
  port: 5432,
});

// Add error handling for database connection
db.connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch((err) => {
    console.error("Error connecting to database:", err);
    process.exit(1);
  });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("Public"));

app.get("/", async (req, res) => {
  res.render("index.ejs", { books: null, error: null });
});

app.get("/books", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books");
    res.send(result.rows);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

app.get("/search", async (req, res) => {
  // search books
  //const searchBooks = req.body.search;
  const query = req.query.search_input;
  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(
      query
    )}`;
    const result = await axios.get(url);

    const books = result.data.docs.map((book) => ({
      title: book.title,
      author: book.author_name ? book.author_name[0] : "Unknown Author",
      year: book.first_publish_year || "Unknown Year",
      edition: book.edition_count,
      coverId: book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : null,
      key: book.key,
    }));

    res.render("index.ejs", { books, result, error: null });
  } catch (error) {
    console.error("Error searching books:", error);
    res.render("index.ejs", { books: null, error: "Failed to search books" });
  }
});

app.listen(port, () => {
  console.log("Server is running on port 3000");
});
