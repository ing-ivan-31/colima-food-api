//Libraries
let express = require('express');
require('dotenv').config();

// App Instance
const app = express();
const config = require('./src/config/config')(__dirname, app);
const port = config.getPort();

// Execute App
app.listen(port, () => {
    console.log('Backend running on Port: ',port);
});
