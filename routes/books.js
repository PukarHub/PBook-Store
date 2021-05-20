const express = require('express')
const router = express.Router();  
const Book = require('../models/book')
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']


//const uploadPath = path.join('public', Book.coverImageBasePath)

// const storage = multer.diskStorage({
//     destination: uploadPath,
//     fileFilter: (req,file,callback) => {
//         callback(null, imageMimeTypes.includes(file.mimetype))
//     }
// });

// const upload = multer({storage}); //provide the return value from storage


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
         // res.redirect(`books/${newBook.id}`)
         res.redirect(`books`)
        } catch {
            renderNewPage(res, book, true)
          }
        })
          
async function renderNewPage(res, book, hasError = false) {
    try {
      const authors = await Author.find({})
      const params = {
        authors: authors,
        book: book
      }
      if (hasError) params.errorMessage = 'Error Creating Book'
      res.render('books/new', params)
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