const { create } = require('ipfs-http-client')
const express = require('express')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const fs = require('fs')
const sdk = require('matrix-js-sdk')



// const ipfs = create('/ip4/127.0.0.1/tcp/5001')
const ipfs = create({
    url: '/ip4/127.0.0.1/tcp/5001',
    emitSelf: true,
    pubsub: { emitSelf: true },
    config: {
        pubsub: { emitSelf: true }
    }
})
const app = express()

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(fileUpload())

const topic = 'helloAimanzaethbq785gjb'

app.get('/', async (req, res) => {
    const receiveMsg = (msg) => {
        console.log('GOT MESSAGE')
        console.log(msg?.data)
        var textEncoding = require('text-encoding');
        var TextDecoder = textEncoding.TextDecoder;
        var uint8array = new TextEncoder().encode("¢");
        var theOutput = new TextDecoder().decode(msg?.data);
        var outputObj = JSON.parse(theOutput)
        console.log(outputObj?.thisMessage)
    }

    await ipfs.pubsub.subscribe(topic, receiveMsg)

    res.render('home')
})

app.post('/upload', async (req, res) => {
    console.log("GOING THROUGH FILE")

    await ipfs.pubsub.publish(topic, JSON.stringify({ thisMessage: 'is from myself!' }))

    // console.log("Checkpoint 1")

    // console.log(req.body)
    const file = req.files.file
    const fileName = req.body.filename
    const filePath = 'files/' + fileName

    // console.log("Checkpoint 2")
    // console.log(file)
    // console.log(fileName)
    // console.log(filePath)
    // console.log("Checkpoint 2.1")

    file.mv(filePath, async (err) => {

        // console.log("Checkpoint 3")
        if (err) {
            // console.log('Error: failed to download the file')
            return res.status(500).send(err)
        }

        // console.log("Checkpoint 4")
        // console.log(fileName)
        // console.log(filePath)

        const fileHash = await addFile(fileName, filePath)

        // console.log("Checkpoint 5")

        fs.unlink(filePath, (err) => {
            if (err) console.log('Error: failed to unlink the file')
        })

        // console.log("Checkpoint 6")

        res.render('upload', {
            fileName, fileHash
        })

        // console.log("Checkpoint 7")
    })
})

const addFile = async (fileName, filePath) => {

    // console.log("Checkpoint 4.1")
    const file = fs.readFileSync(filePath)
    // console.log("Checkpoint 4.2")
    // console.log(fileName)
    // console.log(file)
    const fileAdded = await ipfs.add({ path: fileName, content: file })
    // console.log("Checkpoint 4.3")
    // console.log(fileAdded)
    const fileHash = fileAdded.cid
    // console.log("Checkpoint 4.4")

    return fileHash
}

app.listen(3000, () => {
    console.log('Server started on port 3000, http://localhost:3000')
})