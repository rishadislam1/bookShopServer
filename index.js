const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

const cors = require('cors');

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://tech-net:P20AusU6xnbKHrhI@cluster0.izzbewl.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db('bookshop');
    const bookCollection = db.collection('books');
    const wishlistCollection = db.collection('wishlist');
    const finishCollection = db.collection('finish');

    app.get('/books', async (req, res) => {
      const cursor = bookCollection.find({});
      const product = await cursor.toArray();

      res.send({ status: true, data: product });
    });

    app.post('/addbook', async (req, res) => {
      const book = req.body;

      const result = await bookCollection.insertOne(book);

      res.send(result);
    });

    app.get('/book/:id', async (req, res) => {
      const id = req.params.id;

      const result = await bookCollection.findOne({ _id: new ObjectId(id) });
   
      res.send(result);
    });

     app.post('/comment/:id', async (req, res) => {
      const bookId = req.params.id;
      const comment = req.body.comment;

      const result = await bookCollection.updateOne(
        { _id: new ObjectId(bookId) },
        { $push: { comments: comment } }
      );

   

      if (result.modifiedCount !== 1) {
        console.error('Product not found or comment not added');
        res.json({ error: 'Product not found or comment not added' });
        return;
      }

      console.log('Comment added successfully');
      res.json({ message: 'Comment added successfully' });
    });

     app.get('/comment/:id', async (req, res) => {
      const bookId = req.params.id;

      const result = await bookCollection.findOne(
        { _id: new ObjectId(bookId) },
        { projection: { _id: 0, comments: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Book not found' });
      }
    });

    app.delete('/book/:id', async (req, res) => {
      const id = req.params.id;

      const result = await bookCollection.deleteOne({ _id: new ObjectId(id) });
    
      res.send(result);
    });


    app.patch('/updateBooks/:id', async (req, res) => {
      
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateBook = req.body;
      console.log(updateBook)
      const updateDoc = {
          $set: {
              Title: updateBook.Title,
             Author: updateBook.Author, 
             Genre: updateBook.Genre, 
             PublicationYear: updateBook.PublicationYear, 
             UserEmail: updateBook.UserEmail
          },
      };
      const result = await bookCollection.updateOne(filter, updateDoc);
      res.send(result);
  })

  // wishlist
  app.post('/addWishlist', async (req, res) => {
    const book = req.body;

    const result = await wishlistCollection.insertOne(book);

    res.send(result);
  });
  

  app.get('/wishlist', async (req, res) => {
    const cursor = wishlistCollection.find({});
    const wishlistItem = await cursor.toArray();

    res.send({ status: true, data: wishlistItem });
  });
  
  
  app.delete('/wishlist/:id', async (req, res) => {
    const id = req.params.id;
    const result = await wishlistCollection.deleteOne({ _id: new ObjectId(id) });
  
    res.send(result);
  });

  
    // Finish
    app.post('/addFinish', async (req, res) => {
      const finish = req.body;
  
      console.log('hit')
      const result = await finishCollection.insertOne(finish);
  
      res.send(result);
    });
    app.get('/finish', async (req, res) => {
      const cursor = finishCollection.find({});
      const finishItem = await cursor.toArray();
  
      res.send({ status: true, data: finishItem });
    });

  } finally {
  }
};

run().catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`BookShop listening on port ${port}`);
});
