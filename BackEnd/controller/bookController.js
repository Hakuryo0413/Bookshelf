const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  ID: { type: Number },
  Title: { type: String },
  VolumeInfo: { type: String },
  // Series: { type: String },
  // Periodical: { type: String },
  Author: { type: String },
  Year: { type: String },
  Edition: { type: String },
  Publisher: { type: String },
  // City: { type: String },
  // Pages: { type: String },
  PagesInFile: { type: Number },
  Language: { type: String },
  Topic: { type: String },
  Library: { type: String },
  Issue: { type: String },
  // Identifier: { type: String },
  // ISSN: { type: String },
  // ASIN: { type: String },
  // UDC: { type: String },
  // LBC: { type: String },
  // DDC: { type: String },
  // LCC: { type: String },
  // Doi: { type: String },
  // Googlebookid: { type: String },
  // OpenLibraryID: { type: String },
  // Commentary: { type: String },
  // DPI: { type: Number },
  // Color: { type: String },
  // Cleaned: { type: String },
  // Orientation: { type: String },
  // Paginated: { type: String },
  // Scanned: { type: String },
  // Bookmarked: { type: String },
  // Searchable: { type: String },
  Filesize: { type: Number },
  // Extension: { type: String },
  MD5: { type: String },
  // Generic: { type: String },
  // Visible: { type: String },
  // Locator: { type: String },
  // Local: { type: Number },
  TimeAdded: { type: Date },
  TimeLastModified: { type: Date },
  Coverurl: { type: String },
  // Tags: { type: String },
  // IdentifierWODash: { type: String }
});

const Books = mongoose.model("books", bookSchema, "updated");

const bookCtrl = {
  autocomplete: async (req, res) => {
    try {
      const keyword = req.query.searchValue;
      const books = await Books.find({
        $or: [
          { code: { $regex: keyword, $options: 'i' } },
          { name: { $regex: keyword, $options: 'i' } },
        ]
      }).limit(5);
      if (books) {
        res.json(books);
      } else {
        const books = await Books.aggregate([
          {
            $search: {
              "autocomplete": {
                "query": keyword,
                "path": ["name", "code"],
                "fuzzy": {
                  "maxEdits": 2,
                  "prefixLength": 2
                }
              }
            }
          },
        ]).limit(5);
        if (books) {
          res.json(books);
        } else {
          res.json({ msg: "No books found" });
        }
      }
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  create: async (req, res) => {
    try {
      const { code, name, description, image, price, author, category, language, publishYear } = req.body;

      const book = await Books.findOne({ code: code });
      if (book) {
        console.log(book)
        return res.json({ msg: "Code book registered", create: false });
      }
      const newBook = new Books({
        code,
        name,
        description,
        image,
        price,
        author,
        category,
        language,
        publishYear,
        lab: [],
      });
      // Save mongodb
      await newBook.save();
      res.json({ msg: "Created book successfully", create: true });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.body;
      const book = await Books.findOne({ _id: id });
      if (!book) {
        return res.status(400).json({ msg: "Book not found" });
      }
      await Books.findByIdAndUpdate(id, req.body, { new: true });
      res.json({ msg: "Book updated", update: true });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.body;
      const book = await Books.findOne({ _id: id });
      if (!book) {
        return res.json({ msg: "Book not found" });
      }
      await Books.findByIdAndDelete(id);
      res.json({ msg: "Book deleted", delete: true });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  upload: async (title, filePath) => {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error('File not found');
        return;
      }

      // Read file from system path
      const fileBuffer = fs.readFileSync(filePath);

      // Upload PDF file to GridFS
      const uploadStream = bucket.openUploadStream(title);
      uploadStream.end(fileBuffer);

      // Save book details to MongoDB
      uploadStream.on('finish', async () => {
        const book = new Book({ title: title, pdfFile: title });
        await book.save();
        console.log('Book uploaded successfully');
      });

      console.log('Book uploading...');
    } catch (err) {
      console.error(err);
    }
  },
  getBookPDF: async (title) => {
    try {
      // Find the book by title
      const book = await Book.findOne({ title: title }).exec();
      if (!book) {
        console.error('Book not found');
        return;
      }

      // Retrieve PDF file from GridFS
      const downloadStream = bucket.openDownloadStreamByName(book.pdfFile);

      // Create a write stream to save the PDF file
      const writeStream = fs.createWriteStream(`${title}.pdf`);
      downloadStream.pipe(writeStream);

      // Handle download completion
      writeStream.on('finish', () => {
        console.log('Book PDF retrieved successfully');
      });

      console.log('Book PDF retrieving');
    } catch (err) {
      console.error(err);
    }
  },

  getAllBooks: async (req, res) => {
    try {
      const books = await Books.find().limit(1000);
      console.log(books)
      if (books) {
        res.json(books);
      } else {
        res.json({ msg: "No books found" });
      }
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getBookById: async (req, res) => {
    try {
      const { id } = req.body;
      const book = await Books.findOne({ ID: id });
      if (book) {
        res.json(book);
      } else {
        res.json({ msg: "No book with such id"});
      }
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getAllBooksBySearch: async (req, res) => {
    try {
      const {id, keyword} = req.query;
      if (id) {
        console.log(id)
        const book = await Books.findOne({ ID: id });
        if (book) {
          res.json(book);
        } else {
          res.json({ msg: "No book with such id"});
        }
        return;
      }
      const books = await Books.find({
        $or: [
          { Title: { $regex: keyword, $options: 'i' } },
        ]
      });
      if (books) {
        res.json(books);
      } else {
        res.json({ msg: "No such book" });
      }
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = bookCtrl;