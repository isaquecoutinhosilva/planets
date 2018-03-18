
var mongoose = require('mongoose');
var model = mongoose.model('Planeta');

function PlanetaDAO(connection){       
     return this;
}

PlanetaDAO.prototype.lista = function(callback){    
    model.find()
    .then(function(planetas) {    
        callback('',planetas);        
    }, function(error) {
        callback(error,'');        
    });    
 }

 PlanetaDAO.prototype.buscaPorNome = function(nome,callback){    
    model.findOne( {'nome' : new RegExp('^'+nome+'$', "i") })
    .then(function(planeta) {
        if (!planeta) 
        {callback('Planeta não encontrado','')}
        else{
            callback('',planeta);
        }        
    }, function(error) {
        console.log(error);
        callback(error,'');
    });
 }

 PlanetaDAO.prototype.salva = function(planeta,callback){
    
    model.create(planeta)
    .then(function(planeta) {
        callback('',planeta);
    }, function(error) {
        console.log(error);        
        callback(error,'');
    });
 }

 PlanetaDAO.prototype.remove = function(req,res, memcachedClient){  
    
    PlanetaDAO.prototype.buscaPorId(req.params.id, function(err, results){

        if(err){
            console.log(err);
            res.status(500).json(err);
            return;
          }

          model.remove({'_id' : req.params.id})
          .then(function() {
              
                memcachedClient.del(
                  'planeta-' + req.params.id.toString().toUpperCase(), 
                  function (err) { 
                      if(err){
                           console.log("Não foi possível retirar o planeta do cache - Id");
                       } else {
                           console.log("Planeta removido do cache com sucesso");
                       }
                });        

                memcachedClient.del(
                    'planeta-' + results.nome.toString().replace(/\s/g, "-").toUpperCase(), 
                    function (err) { 
                        if(err){
                             console.log("Não foi possível retirar o planeta do cache - Nome");
                         } else {
                             console.log("Planeta removido do cache com sucesso");
                         }
                  });                        
              
              res.sendStatus(204);
          }, function(error) {
              console.log(error);
              res.status(500).json(error);
          });
    });
 } 

 PlanetaDAO.prototype.buscaPorId = function(id,callback){    
    model.findById(id)
    .then(function(planeta) {
        if (!planeta) 
        {callback('Planeta não encontrado','')}
        else{
            callback('',planeta);
        }        
    }, function(error) {
        console.log(error);
        callback(error,'');
    });
 }

 module.exports = function(){
    return PlanetaDAO;   
 }