var app = require('./config/express')();

require('./config/database')();

//var porta = process.env.PORT || 3000;
var porta = 3000;
app.listen(porta, function(){
    console.log('servidor rodando');
});
