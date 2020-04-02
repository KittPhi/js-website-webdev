const express = require('express');
var bodyParser = require('body-parser');
const app = express();
const port = 3000;

// allows http://localhost:3000/hello.html in public folder
app.use(express.static("public"));

// url body parsing middleware
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (request, response) => response.send('Hello World!'));

app.post('/formSubmit', function(request, response) {
    console.log(request.body.user.name);
    console.log(request.body.user.email);
    response.send("Success");
})

app.listen(port, () => console.log(`App listening on port ${port}!`));