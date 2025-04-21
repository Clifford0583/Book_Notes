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

// get books from the database
async function getBooks() {
  try {
    const result = await db.query("SELECT * FROM books");
    return result.rows;
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
}

app.get("/", async (req, res) => {
  res.render("index.ejs", { books: null, error: null });
});

// get books from the database and render it to the books.ejs page
app.get("/books", async (req, res) => {
  try {
    const books = await getBooks();
    res.render("books.ejs", { books: books });
  } catch (error) {
    console.error("Error in /books route:", error);
    res
      .status(500)
      .render("books.ejs", { books: [], error: "Failed to fetch books" });
  }
});

app.get("/search", async (req, res) => {
  // search route for  books to the api

  const query = req.query.search_input;
  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(
      query
    )}`;
    const result = await axios.get(url);
    const workID = result.data.docs[0].key; // get the book key or work id
    const bookId = workID.split("/").pop(); // Extract the book ID from the URL

    const books = result.data.docs.map(async (book) => {
      //map book the data to the required format
      let summary = null;
      if (book.key) {
        try {
          const workUrl = `https://openlibrary.org${book.key}.json`;
          const workResponse = await axios.get(workUrl);
          if (workResponse.data.description) {
            // CHECK IF THE DESCRIPTION EXISTS
            //if description is a text use it else if its not (object) use the value
            summary =
              typeof workResponse.data.description === "string"
                ? workResponse.data.description
                : workResponse.data.description.value;
          }
        } catch (error) {
          console.error("Error fetching work details:", error);
        }
      }
      return {
        // returns properties of books
        title: book.title,
        author: book.author_name ? book.author_name[0] : "Unknown Author",
        year: book.first_publish_year || "Unknown Year",
        edition: book.edition_count,
        coverId: book.cover_i
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
          : null,
        summary: summary,
        bookWork: bookId,
      };
    });

    const resolvedBooks = await Promise.all(books);
    res.render("index.ejs", { books: resolvedBooks, result, error: null });
  } catch (error) {
    console.error("Error searching books:", error);
    res.render("index.ejs", { books: null, error: "Failed to search books" });
  }
});

app.post("/addBook", async (req, res) => {
  try {
    // get body request data and destructure it
    const date = new Date().toISOString();
    const { title, author, year, edition, summary, work } = req.body;
    const coverId = req.body.coverId || null;
    const formattedYear = year ? `${year}` : null; // Convert year to a proper date format (YYYY-01-01)

    // insert book to books db
    await db.query(
      "INSERT INTO books (book_title, author, book_year, edition, summary, cover, date_added, book_work) VALUES ($1, $2, $3, $4, $5, $6, $7,$8)",
      [title, author, formattedYear, edition, summary, coverId, date, work]
    );
    res.redirect("/");
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({ error: "Failed to add book" });
  }
});

app.listen(port, () => {
  console.log("Server is running on port 3000");
});
