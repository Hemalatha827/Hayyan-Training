const http = require('http');
const express = require('express');
const app = express();
app.use(express.json());

const searchRoutes = require('./routes/searchRoute');
const cartRoutes = require('./routes/cartRoute');
const validationRoute = require('./routes/utilityRoute');
const orderRoute = require('./routes/orderRoute');
const testRoutes = require('./routes/testRoute');

app.use('/search', searchRoutes)
app.use('/cart', cartRoutes)
app.use('/order', orderRoute)
app.use('/utility', validationRoute)
app.use('/test', testRoutes)

const server = http.createServer(app);
const port = 8080;
server.listen(port);
console.debug('Server listening on port ' + port);