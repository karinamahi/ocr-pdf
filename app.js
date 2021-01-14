const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');
const { createWorker} = require('tesseract.js')
const worker = createWorker({
    logger: m => console.log(m)
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads")
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

const upload = multer({storage}).single('avatar');
app.set('view engine', 'ejs');
app.use(express.static('public'))

//routes
app.get('/', (req, res) => {
    res.render('index');
})

app.post('/uploads', (req, res)=> {
    upload(req, res,err => {
        console.log(req.file);
        // fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
        //     if(err) return console.log("Error: ", err);

             work(`./uploads/${req.file.originalname}`)
             .then(text => {
                //  res.send(text);
                res.redirect("/download")
             })
        // });

    })
})

app.get('/download', (req,res)=> {
    const file = `${__dirname}/tesseract-ocr-result.pdf`;
    res.download(file);
});

async function work(filename) {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    // let result = await worker.detect(filename);
    // console.log(result.data);

    let result = await worker.recognize(filename);
    // console.log(result.data);

    const { data } = await worker.getPDF('Tesseract OCR Result');
    fs.writeFileSync('tesseract-ocr-result.pdf', Buffer.from(data));
    console.log('Generate PDF: tesseract-ocr-result.pdf');

    await worker.terminate();
    console.log("TEXTO: ", result.data.text);
    return result.data.text;
  }


const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => {
    console.log('Hey, I am running at ', PORT)
});
