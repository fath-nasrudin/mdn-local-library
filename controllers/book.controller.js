const Book = require("../models/book.model");
const Author = require('../models/author.model');
const Genre = require('../models/genre.model');
const BookInstance = require('../models/bookinstance.model');

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require('express-validator');

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
  const [allAuthors, allGenres] = await Promise.all([
    Author.find().sort({ family_name: 1 }),
    Genre.find().sort({ name: 1 })
  ]);

  res.render('book_form', {
    title: 'Create Book',
    authors: allAuthors,
    genres: allGenres,
  })
});

// Handle book create on POST.
exports.book_create_post = [

  // Convert the genre to an array.
  (req, res, next) => {
    const { genre } = req.body;
    if (!Array.isArray(genre)) {
      req.body.genre =
        typeof genre === 'undefined' ? [] : [req.body.genre]
    }
    next();
  },

  // valdiate and sanitize fields
  body('title', 'Title must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  body('author', 'Author must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  body('summary', 'Summary must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  body('isbn', 'ISBN must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  body('genre.*')
    .escape(),

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // handle validation errors
    const errors = validationResult(req);
    const { body } = req;

    if (!errors.isEmpty()) {

      // Get all authors and genres for form.
      const [allAuthors, allGenres] = await Promise.all([
        Author.find().sort({ family_name: 1 }).exec(),
        Genre.find().sort({ name: 1 }).exec(),
      ]);

      // Potongan kode ini gua kurang ngerti bagian genre.checked
      // Mark our selected genres as checked.
      for (const genre of allGenres) {
        if (body.genre.includes[genre._id]) {
          genre.checked = 'true';
        }
      }

      re.render('book_form', {
        title: 'Create Book',
        authors: allAuthors,
        genres: allGenres,
        book: body,
        errors: errors.array(),
      })
      return;
    }

    // Create a Book object with escaped and trimmed data.
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    await book.save();
    res.redirect(book.url);
  }),
];

// Display book delete form on GET.
exports.book_delete_get = asyncHandler(async (req, res, next) => {
  const [
    book,
    book_instances,
  ] = await Promise.all([
    Book.findById(req.params.id),
    BookInstance.find({ book: req.params.id }),
  ]);

  res.render('book_delete', {
    title: 'Delete Book',
    book,
    book_instances,
  })
  // res.send("NOT IMPLEMENTED: Book delete GET");
});

// Handle book delete on POST.
exports.book_delete_post = asyncHandler(async (req, res, next) => {
  const [
    book,
    book_instances,
  ] = await Promise.all([
    Book.findById(req.params.id),
    BookInstance.find({ book: req.params.id }),
  ]);

  if (bookinstances.length > 0) {
    res.render('book_delete', {
      title: 'Delete Book',
      book,
      book_instances,
    });
    return;
  }

  await book.deleteOne();
  res.redirect('/catalog/books');



});

// Display book update form on GET.
exports.book_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book update GET");
});

// Handle book update on POST.
exports.book_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book update POST");
});