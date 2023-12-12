const Book = require("../models/book.model");
const Author = require('../models/author.model');
const Genre = require('../models/genre.model');
const BookInstance = require('../models/bookinstance.model');

const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  // Get details of books, book instances, authors and genre counts (in parallel)

  const [
    numBooks,
    numBookInstances,
    numAvailableBookInstances,
    numGenres,
    numAuthors,
  ] = await Promise.all([
    Book.countDocuments(),
    BookInstance.countDocuments(),
    BookInstance.countDocuments({ status: 'available' }),
    Genre.countDocuments(),
    Author.countDocuments(),
  ])

  res.render('index', {
    title: "Local Library Home",
    book_count: numBooks,
    book_instance_count: numBookInstances,
    book_instance_available_count: numAvailableBookInstances,
    author_count: numAuthors,
    genre_count: numGenres,
  })

});

// Display list of all books.
exports.book_list = asyncHandler(async (req, res, next) => {
  const books = await Book
    .find({}, "title author")
    .sort({ title: 1 })
    .populate('author')
    .exec();

  res.render('book_list', {
    title: 'Book List',
    book_list: books,
  })
});

// Display detail page for a specific book.
exports.book_detail = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const [book, bookInstances] = await Promise.all([
    Book.findById(id).populate('author').populate('genre'),
    BookInstance.find({ book: id }),
  ]);

  if (!book) {
    const err = new Error('Book not found');
    err.status = 404;
    return next();
  }

  res.render('book_detail', {
    title: book.title,
    book,
    book_instances: bookInstances,
  })
});

// Display book create form on GET.
exports.book_create_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book create GET");
});

// Handle book create on POST.
exports.book_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book create POST");
});

// Display book delete form on GET.
exports.book_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book delete GET");
});

// Handle book delete on POST.
exports.book_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book delete POST");
});

// Display book update form on GET.
exports.book_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book update GET");
});

// Handle book update on POST.
exports.book_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book update POST");
});