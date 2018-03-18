var express = require('../config/express')();
var request = require('supertest')(express);
var mongoose = require('mongoose');

describe('PlanetasController',function(){

    before(function (done) {
        mongoose.connect('mongodb://localhost/planetas', done);
      });

    it('Listagem de Planetas',function(done){
        
        request.get('/planetas')
        .set('Accept', 'application/json')    
        .expect(200,done)
        .expect('Content-Type', /json/)
        
    });

    it('Cadastro de novo planeta com dados inválidos',function(done){
        
        request.post('/planetas')
        .send({nome:"", clima:"arido", terreno:"rochoso"})
        .expect(400,done)
    });    

    it('Cadastro de novo planeta com dados válidos',function(done){        
        request.post('/planetas')
        .send({nome:"Utapau", clima:"arido", terreno:"rochoso"})
        .expect(201,done)
    });

    it('Buscar por nome com dados Inválidos',function(done){        
        request.get('/planetas/nome=xxx')
        .expect(500,done)
    });    

    it('Buscar por nome com dados Válidos',function(done){        
        request.get('/planetas/nome=Utapau')
        .expect(200,done)
    });    

    it('Buscar por Id com dados Inválidos',function(done){        
        request.get('/planetas/id=xxx')
        .expect(500,done)
    });            
});
