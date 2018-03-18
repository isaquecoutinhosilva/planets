var mongoose = require('mongoose');

var schema = mongoose.Schema({
    
        nome: {
            type: String,
            required: true,
            index: { unique: true }
        },
        clima: {
            type: String,
            required: true
        },
        terreno: {
            type: String,
            required: true
        }
    });
    
     // compilando um modelo com base no esquema
    mongoose.model('Planeta', schema);