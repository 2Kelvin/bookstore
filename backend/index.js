import express from 'express';
import mysql from 'mysql';
import cors from 'cors';

// creating my express server
const app = express();

// connecting to mysql
const sqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
});

// creating 'bookshelf' db
const createDbQuery = 'CREATE DATABASE IF NOT EXISTS bookshelf';
sqlConnection.query(createDbQuery, (err, result) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('bookshelf database created successfully:', result);
});

// connecting to mysql 'bookshelf' database
const bookshelfDb = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bookshelf',
});

// creating 'books' table in bookshelf db
const createTableQuery = 'CREATE TABLE IF NOT EXISTS books (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, title VARCHAR(80) NOT NULL, author VARCHAR(150) NOT NULL, description VARCHAR(255) NOT NULL, cover VARCHAR(80) NULL, owner VARCHAR(80) NOT NULL, isAvailable VARCHAR(5) NOT NULL)';
bookshelfDb.query(createTableQuery, (err, result) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('books table created successfully:', result);
});

// middleware that parses the json string sent from client
// converts it (json string) to a javascript object & attaches it to request.body
// then finally pushes the request to the route handler function to use
app.use(express.json());
// allow backend server to be accessed by the client (frontend) to fetch the api data
app.use(cors());

// home route
app.get('/', (req, res) => {
    res.json('This is the backend home route');
});

// books routes
// returning all books in book-app db
app.get('/books', (req, res) => {
    const getBooksQuery = 'SELECT * FROM books';

    bookshelfDb.query(getBooksQuery, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

// creating a new book into bookshelf.books table
app.post('/books', (req, res) => {
    const addBooksQuery = 'INSERT INTO books (`title`, `author`, `description`, `cover`, `owner`, `isAvailable`) VALUES (?)';
    // new book info will be accessed thro the request's body
    const bookValues = [
        req.body.title,
        req.body.author,
        req.body.description,
        req.body.cover,
        req.body.owner,
        req.body.isAvailable,
    ];
    bookshelfDb.query(addBooksQuery, [bookValues], (err, data) => {
        if (err) return res.json(err);
        return res.json('A new book has been added');
    });
});

// route for deleting a book
// deleting the book whose 'id' is given
app.delete('/books/:bookId', (req, res) => {
    // getting the book id from url parameters
    const bookId = req.params.bookId;
    const deleteBookQuery = 'DELETE FROM books WHERE id = ?';
    bookshelfDb.query(deleteBookQuery, [bookId], (err, data) => {
        if (err) return res.json(err);
        return res.json('A book has been deleted');
    });
});

// route for updating a book
// updating the book whose 'id' is given
app.put('/books/:bookId', (req, res) => {
    // getting the book id from url parameters
    const bookId = req.params.bookId;
    const updateBookQuery = 'UPDATE books SET `title` = ?, `author` = ?, `description` = ?, `cover` = ?, `owner` = ?, `isAvailable` = ? WHERE id = ?';
    const bookValues = [
        req.body.title,
        req.body.author,
        req.body.description,
        req.body.cover,
        req.body.owner,
        req.body.isAvailable,
    ];
    bookshelfDb.query(updateBookQuery, [...bookValues, bookId], (err, data) => {
        if (err) return res.json(err);
        return res.json('The book has been updated');
    });
});

// express server application listening on port 3000
app.listen(8800, () => {
    console.log('********** Backend connected (Express server is running on port 8800) **********\n');
});

// enter this code in mysql to clear auth msql error
// ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';