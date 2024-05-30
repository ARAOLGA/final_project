const express = require('express');
const app = express();
const port = 3000;

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(port, () => {
    console.log(`Frontend app listening at http://www.cloudeof.com:${port}`);
});
