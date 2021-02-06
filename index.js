const express = require('express'); 
const app = express();
app.use(express.static('public'));
app.get('/', (req, res) => {
     res.sendFile('index.html', {root: __dirname + '/public/'});
});
app.listen(process.env.PORT || 5000)