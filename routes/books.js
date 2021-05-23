const express = require('express')
const router = express.Router();  
const Book = require('../models/book')
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

//All Books Route
router.get('/', async (req, res) => {
  let query = Book.find()
  //Search using Title
  if(req.query.title != null && req.query.title != ''){
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }

  //Search using Publish Before Date
  if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
    query = query.lte('publishDate', req.query.publishedBefore)
  }

    //Search using Publish After Date
    if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
      query = query.gte('publishDate', req.query.publishedAfter)
    }

  try { 
    const books = await query.exec()
    res.render('books/index', {
      books:books,
      searchOptions: req.query
    })

  } catch (error) {
    res.redirect('/')
  }
})

//New Book Route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})
  
//Create Book Route
router.post('/', async (req, res) => {

    const book = new Book({
        title: req.body.title,  
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,  
        description: req.body.description
    })  
    saveCover(book, req.body.cover)
    try {
        const newBook = await book.save()
        res.redirect(`books/${newBook.id}`)
        } catch {
            renderNewPage(res, book, true)
          }
})

//Show Books  
router.get('/:id', async(req,res) => {
  try {
    const book = await Book.findById(req.params.id).populate('author').exec()
    res.render('books/show', {book: book})
  } catch {
    res.redirect('/')
  }
})   

//Edit Book
router.get('/:id/edit', async (req,res) => {
  try {
      const book = await Book.findById(req.params.id)
      renderEditPage(res,book)
  } catch (error) {
      res.redirect('/books')
  }
})

//Update Book Route
router.put('/:id', async (req, res) => {
 let book
 try {
   book = await Book.findById(req.params.id)
   book.title = req.body.title,
   book.author = req.body.author,
   book.publishDate = new Date(req.body.publishDate),
   book.pageCount = req.body.pageCount,  
   book.description = req.body.description
   if(req.body.cover != null && req.body.cover !== ''){
     saveCover(book, req.body.cover)
   }
   await book.save()
   res.redirect(`/books/${book.id}`)
 } catch (error) {
   console.log(error);
   if(book != null){
     renderEditPage(res, book, true)
   } else {
     redirect('/')
   }
 } 
})

//Delete Book Route
router.delete('/:id', async(req,res) => {
  let book
  try {
      book = await Book.findById(req.params.id)
      await book.remove()
      res.redirect('/books')
  } catch {
      if(book != null){
          res.render('books/show', {
            book,
            errorMessage: 'Could not remove book'
          })
          }else {
          res.redirect('/')
      } 
  }
}) 
 

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res,book,'new', hasError)
  }

async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res,book,'edit', hasError)
  }  


async function renderFormPage(res, book, form, hasError = false) {
    try {
      const authors = await Author.find({})
      const params = {
        authors: authors,
        book: book
      }
      if(hasError){
        if(form == 'edit'){
          params.errorMessage = 'Error updating Book'
        } else {
          params.errorMessage = 'Error Creating Book'
        }
      }
      res.render(`books/${form}`, params)
    } catch {
      res.redirect('/books')
    }
}

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
      book.coverImage = new Buffer.from(cover.data, 'base64')
      book.coverImageType = cover.type
    }
  }  

module.exports = router