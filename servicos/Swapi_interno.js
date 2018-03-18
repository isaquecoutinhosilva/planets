
var request=require('request');
const swapi = require('swapi-node');

function Swapi_interno(){
    return this;
}

Swapi_interno.prototype.getPlanets = function(app){
    
    var full_result = {};
        
    var getNextPage_recursivo = function(page){
        if(page.next){

            page.nextPage(page).then(function(page){
                full_result.results = full_result.results.concat(page.results);
                getNextPage_recursivo(page);
            }, function(error){
                console.log(error);
            })
        } else {
            
            var memcachedClient = app.servicos.memcachedClient();

            var selects = full_result.results.map(row => function(row){

                return new Promise((retorno, rej) =>{                  

                    memcachedClient.set(
                        'planeta-qtdFilmes-' + row.name.toString().replace(/\s/g, "-").toUpperCase(), 
                        row.films.length,   
                        0 /*never expires*/, 
                        function(erro){
                            if(erro){
                                console.log('Houve um problema ao setar o cache da quantidade de filmes');
                                console.log(erro);
                                rej(null);
                                return;
                            }
                            
                            console.log('Nova chave adicionada ao cache : ' + 'planeta-qtdFilmes-' + row.name.toString().replace(/\s/g, "-").toUpperCase());
                            retorno(row);
                        }
                    );
                });

            }(row));

            Promise.all(selects)
            .then(function(results){
            }, function(erro){
                console.log(erro);
            });
        }
    }

    try {
        swapi.getPlanet().then((result) => {
            console.log(result);
            full_result = result;
    
            if (result.next){
                getNextPage_recursivo(result);
            }
    
        }).catch((err) => {
            console.log(err);
        });        
    } catch (error) {
        console.log("Não foi possível acessar o servidor externo swapi.com");
    }

}
module.exports = function(app){    
    
    Swapi_interno.prototype.getPlanets(app);
    return Swapi_interno;
}



 

