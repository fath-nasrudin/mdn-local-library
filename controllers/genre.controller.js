const Genre = require("../models/genre.model");
const Book = require('../models/book.model');
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require('express-validator');

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const genres = await Genre.find().sort({ name: 1 });

  res.render('genre_list', {
    title: 'Genre List',
    genre_list: genres,
  })
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const [
    genre,
    booksInGenre
  ] = await Promise.all([
    Genre.findById(id),
    Book.find({ genre: id }, 'title summary').sort({ title: 1 }),
  ])

  // No results
  if (!genre) {
    const err = new Error('Genre not found');
    err.status = 404;
    return next(err);
  }

  res.render('genre_detail', {
    title: 'Genre Detail',
    genre,
    genre_books: booksInGenre
  })
});

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render('genre_form', {
    title: 'Create Genre',
  })
};

// Handle Genre create on POST.
exports.genre_create_post = [
  // validate and sanitize the name fields
  body('name', 'Genre name must contain at least 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // process request after validation and sanitazion
  asyncHandler(async (req, res, next) => {
    // check for failed to pass validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // rerender genre form with previous data
      res.render('genre_form', {
        title: 'Create Genre',
        genre: req.body,
        errors: errors.array()
      })
      return;
    } else {
      // mean data from form is valid.

      // check if genre with specific name already exists.
      const genreExists = await Genre.findOne({ name: req.body.name })
        .collation({ locale: 'en', strength: 2 });

      if (genreExists) {
        res.redirect(genreExists.url);
        return;
      }

      const genre = new Genre({ name: req.body.name });
      await genre.save();
      res.redirect(genre.url);
    }
  })];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const [genre, booksWithGenre] = await Promise.all([
    Genre.findById(req.params.id),
    Book.find({ genre: req.params.id }),
  ])
  res.render('genre_delete', {
    title: 'Delete Genre',
    genre,
    genre_books: booksWithGenre,
  })
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const [
    genre,
    booksWithGenre] = await Promise.all([
      Genre.findById(req.params.id),
      Book.find({ genre: req.params.id })
    ]);

  // check if genre found
  if (!genre) {
    const err = new Error('Genre not found');
    err.status = 404;
    return next(err);
  }

  // check for reference by other model instaces
  if (booksWithGenre.length > 0) {
    res.render('genre_delete', {
      title: 'Delete Genre',
      genre,
      genre_books: booksWithGenre,
    })
  }

  // delete genre
  await Genre.findByIdAndDelete(req.params.id);
  res.redirect('/catalog/genres');
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id);
  res.render('genre_form', {
    title: 'Update Genre',
    genre,
  })
});

// Handle Genre update on POST.
exports.genre_update_post = [
  // validate and sanitize the name fields
  body('name', 'Genre name must contain at least 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    // i dont know which is better when updating file,
    // 1. find request, and save request (2 request)
    // 2. findAndUpdate request (1 request)
    // 3. or there are any other options?
    // for now i will use findAndUpdate option
    const updateData = {
      name: req.body.name
    }

    const successUpdateGenre = await Genre.findByIdAndUpdate(req.params.id, updateData)

    if (!successUpdateGenre) {
      const err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }

    res.redirect(successUpdateGenre.url);
  }),
];