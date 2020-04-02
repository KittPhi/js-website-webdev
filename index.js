const express = require('express');
const app = express();   // replaces const express = require('express')(); 
const server = require('http').createServer(app);
const io = require('socket.io')(server);

var bodyParser = require('body-parser');
const port = 3000;

// allows http://localhost:3000/hello.html in public folder
app.use(express.static("public"));

// url and json body parsing middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.get('/', (request, response) => response.send('Hello World!'));
app.get('/', function(request, response) {
    response.sendFile(__dirname + '/index.html');
});
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('chat message', (message) => {
        io.emit('chat message', message);
    });
 });
server.listen(port, function() {
    console.log(`listening on port ${port}`);
});

app.post('/formSubmit', function(request, response) {
    console.log(request.body.user.name);
    console.log(request.body.user.email);
    response.send("Success");
})

app.post('/car', function(request, response) {
    console.log(request.body.make);
    console.log(request.body.model);
    console.log(request.body.year);
    console.log(request.body.color);
    response.send("Success!");
})

// app.listen(port, () => console.log(`App listening on port ${port}!`));