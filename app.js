const { create } = require('ipfs-http-client')
const express = require('express')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const fs = require('fs')



const client = create({ protocol: 'http', host: 'localhost', port: '5001' })
const app = express()

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(fileUpload())

app.get('/', (req, res) => {
    res.render('home')
})

app.post('/upload', (req, res) => {

    console.log("Checkpoint 1")
    console.log(req.body)
    const file = req.files.file
    const fileName = req.body.filename
    const filePath = 'files/' + fileName

    console.log("Checkpoint 2")
    console.log(file)
    console.log(fileName)
    console.log(filePath)
    console.log("Checkpoint 2.1")

    file.mv(filePath, async (err) => {

        console.log("Checkpoint 3")
        if (err) {
            console.log('Error: failed to download the file')
            return res.status(500).send(err)
        }

        console.log("Checkpoint 4")

        const fileHash = await addFile(fileName, filePath)

        console.log("Checkpoint 5")

        fs.unlink(filePath, (err) => {
            if (err) console.log('Error: failed to unlink the file')
        })

        console.log("Checkpoint 6")

        res.render('upload', {
            fileName, fileHash
        })

        console.log("Checkpoint 7")
    })
})

const addFile = async (fileName, filePath) => {

    console.log("Checkpoint 4.1")
    const file = fs.readFileSync(filePath)
    console.log("Checkpoint 4.2")
    console.log(fileName)
    console.log(file)
    // const fileAdded = await client.add('Hello world!')
    const fileAdded = await client.add({ path: fileName, content: file })
    console.log("Checkpoint 4.3")
    const fileHash = fileAdded[0].hash
    console.log("Checkpoint 4.4")

    return fileHash
}

app.listen(3000, () => {
    console.log('Server started on port 3000, http://localhost:3000')
})