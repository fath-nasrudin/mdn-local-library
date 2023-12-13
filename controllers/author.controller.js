const Author = require('../models/author.model');
const Book = require('../models/book.model');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

// display list of all authors
exports.author_list = asyncHandler(async (req, res) => {
  const authors = await Author.find().sort({ family_name: 1 });

  res.render('author_list', {
    title: 'Author List',
    author_list: authors,
  });
});

// display detail page for a specific author
exports.author_detail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(id),
    Book.find({ author: id }, 'title summary')
  ]);

  if (!author) {
    const err = new Error('Author not found');
    err.status = 404;
    return next(err);
  }

  res.render('author_detail', {
    title: 'Author Detail',
    author: author,
    author_books: allBooksByAuthor
  })
});

// display author create form on GET
exports.author_create_get = asyncHandler(async (req, res) => {
  res.render('author_form', {
    title: 'Create Author'
  })
});

// Handle Author create on POST.
exports.author_create_post = [
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified.')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters.'),

  body('family_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Family name must be specified.')
    .isAlphanumeric()
    .withMessage('Family name has non-alphanumeric characters.'),

  body('date_of_birth', 'Invalid date of birth')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // handling validation error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('author_form', {
        title: 'Create Author',
        author: req.body,
        errors: errors.array(),
      })
      return;
    }

    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });

    await author.save();
    res.redirect(author.url);
  }),
];

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(id),
    Book.find({ author: id }, 'title summary'),
  ]);

  if (!author) {
    res.redirect('/catalog/authors');
  }

  res.render('author_delete', {
    title: 'Delete Author',
    author: author,
    author_books: allBooksByAuthor,
  })
});

// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const [author, booksByAuthor] = await Promise.all([
    Author.findById(id),
    Book.find({ author: id }, 'title summary'),
  ])

  // check for referenced by other documents
  if (booksByAuthor.length > 0) {
    res.render('author_delete', {
      title: 'Delete Author',
      author: author,
      author_books: booksByAuthor,
    })
    return;
  }

  await Author.findByIdAndDelete(id);
  res.redirect('/catalog/authors');
});

// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
  const author = await Author.findById(req.params.id);

  // handle if author with specified id not found
  if (!author) {
    const err = new Error('Author not found');
    err.status = 404;
    return next(err);
  }

  // render form with author data to be populated
  res.render('author_form', {
    title: 'Update Author',
    author,
  })
});

// Handle Author update on POST.
exports.author_update_post = [
  // validation and sanitization
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified.')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters.'),

  body('family_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Family name must be specified.')
    .isAlphanumeric()
    .withMessage('Family name has non-alphanumeric characters.'),

  body('date_of_birth', 'Invalid date of birth')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),

  // process data
  asyncHandler(async (req, res, next) => {
    // redirect to form with data if validation failed
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      res.render('author_form', {
        author: req.body,
        errors: validationErrors.array(),
      })
      return;
    }


    const updatedAuthor = await Author
      .findByIdAndUpdate(req.params.id, req.body);

    // if author not found
    if (!updatedAuthor) {
      const err = new Error('Author not found');
      err.status = 404;
      next(err);
      return;
    }

    res.redirect(updatedAuthor.url);
  }),
];
