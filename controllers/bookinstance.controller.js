const BookInstance = require("../models/bookinstance.model");
const Book = require('../models/book.model');
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require('express-validator');

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const bookInstances = await BookInstance
    .find()
    .populate('book');

  res.render('bookinstance_list', {
    title: 'Book Instance List',
    bookinstance_list: bookInstances,
  });
});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id).populate('book');



  res.render('bookinstance_detail', {
    title: 'Book:',
    bookinstance: bookInstance,
  })
});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title").sort({ title: 1 });
  res.render('bookinstance_form', {
    title: 'Create BookInstance',
    book_list: allBooks,
  })
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // validate and sanitize fields
  body('book', 'Book must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  body('imprint', 'Imprint must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  body('status').escape(),

  body('due_back', 'Invalid date')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    const validationErrors = validationResult(req);

    // handle validation errors
    if (!validationErrors.isEmpty()) {
      const allBooks = await Book.find({}, 'title').sort({ title: 1 });

      res.render('bookinstance_form', {
        title: 'Create BookInstance',
        book_list: allBooks,
        selected_book: req.body.book,
        errors: validationErrors.array(),
        bookInstance: req.body,
      })
      return;
    }

    // Create a BookInstance object with escaped and trimmed data.
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    await bookInstance.save();
    res.redirect(bookInstance.url);
  })
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const bookinstance = await BookInstance.findById(id).populate('book', 'title');

  res.render('bookinstance_delete', {
    title: 'Delete Bookinstance',
    bookinstance,
  })
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  await BookInstance.findByIdAndDelete(id);
  res.redirect('/catalog/bookinstances');
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance update GET");
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance update POST");
});