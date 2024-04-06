const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.json());

const uploadDirectory = path.join(__dirname, 'uploads');

fs.mkdirSync(uploadDirectory, { recursive: true });

function authenticate(req, res, next) {
    const { password } = req.query;
    if (!password || password !== 'pwd123') {
        return res.status(401).send('Unauthorized');
    }
    next();
}

app.post('/createFile', authenticate, (req, res) => {
    const { filename, content, password } = req.body;
    const filePath = path.join(uploadDirectory, filename);
    fs.writeFile(filePath, content, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error creating file');
        }
        console.log(`File '${filename}' created`);
        res.sendStatus(200);
    });
});

app.get('/getFiles', (req, res) => {
    fs.readdir(uploadDirectory, (err, files) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching files');
        }
        res.json(files);
    });
});

app.get('/getFile/:filename', authenticate, (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(uploadDirectory, filename);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(400).send('File not found');
        }
        res.send(data);
    });
});

app.put('/modifyFile/:filename', authenticate, (req, res) => {
    const { filename } = req.params;
    const { content } = req.body;
    const filePath = path.join(uploadDirectory, filename);

    fs.writeFile(filePath, content, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error modifying file');
        }
        console.log(`File '${filename}' modified`);
        res.sendStatus(200);
    });
});

app.delete('/deleteFile/:filename', authenticate, (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(uploadDirectory, filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting file');
        }
        console.log(`File '${filename}' deleted`);
        res.sendStatus(200);
    });
});

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

const port = 8080;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
