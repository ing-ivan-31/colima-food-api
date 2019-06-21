//Libraries
let express = require('express');
require('dotenv').config();

// App Instance
const app = express();
const config = require('./src/config/config')(__dirname, app);
config.init();
const port = config.getPort();
const logger =  config.getLogger();

// Execute App
app.listen(port, () => {
    console.log('Backend running on Port: ',port);
    logger.info('Server running on port %d', port);
});
