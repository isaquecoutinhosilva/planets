module.exports = function(app){

  app.get('/planetas', function(req,res){
      
      var planetaDAO = new app.persistencia.PlanetaDAO();
      var swapi_interno = new app.servicos.Swapi_interno();    
      var memcachedClient = app.servicos.memcachedClient();

      planetaDAO.lista(function(err, results){
          if(err){
            console.log(err);
            res.status(500).json(err);   
            return;
          }        
          
          console.log("Iniciando preenchimento de json");
          
          var novaLista = [];
          
          var PreencheNovaLista = function(item){ 
              
                return new Promise((retorno, rej) =>{                  
                
                  var novoItem = {};
                  novoItem.id = item._id;  
                  novoItem.nome = item.nome;  
                  novoItem.clima = item.clima;
                  novoItem.terreno = item.terreno;            
                  novoItem.qtdFilmes = 0;              

                  memcachedClient.get('planeta-qtdFilmes-' + item.nome.toString().replace(/\s/g, "-").toUpperCase(), function(erro, result){
                      if(erro || !result){
                        console.log('MISS - chave não encontrada');              
                        console.log('planeta-qtdFilmes-' + item.nome.toString().replace(/\s/g, "-").toUpperCase());
                        retorno(novoItem);              
                      }else {
                        console.log('quantidade de filmes :' + result);
                        novoItem.qtdFilmes = result;
                        retorno(novoItem);              
                      }

                  });

                  novaLista.push(novoItem);
              });
          }         
        
          const selects = results.map(row => PreencheNovaLista(row));
          Promise.all(selects)
            .then(function(results){
              res.json(novaLista);            
          }, function(erro){
              console.log(erro);
              res.status(500).json(erro);
          });
      });  
  });  

  app.get('/planetas/nome=:nome', function(req,res){
    var planetaDAO = new app.persistencia.PlanetaDAO();
    var swapi_interno = new app.servicos.Swapi_interno();
      
    var memcachedClient = app.servicos.memcachedClient();
    
    memcachedClient.get('planeta-'+req.params.nome.toString().replace(/\s/g, "-").toUpperCase(), function(error, retorno){
      
          if(error || !retorno){
            console.log('MISS - chave não encontrada');

            planetaDAO.buscaPorNome(req.params.nome, function(err, results){
              if(err){
                console.log(err);
                res.status(500).json(err);
                return;
              }
                            
              var novoItem = {};
              promise = new Promise((retorno, rej) =>{                  
                
                  novoItem.id = results._id;  
                  novoItem.nome = results.nome;  
                  novoItem.clima = results.clima;
                  novoItem.terreno = results.terreno;            
                  novoItem.qtdFilmes = 0;              
                     
                  memcachedClient.get(
                  'planeta-qtdFilmes-' + results.nome.toString().replace(/\s/g, "-").toUpperCase(), 
                  function(erro, result){
                      if(erro || !result){
                        console.log('MISS - chave não encontrada');              

                        retorno(novoItem);              
                      }else {
                        console.log('quantidade de filmes :' + result);
                        novoItem.qtdFilmes = result;
                        retorno(novoItem);              
                      }
                  });
              });
        
              promise
              .then(function(){
                res.json(novoItem);
              })
              .catch(function(error){
                  console.log(error);
                  res.status(500).json(error);   
              });
          });
      
          }else{
              res.json(retorno);
              console.log('HIT - valor: ' + JSON.stringify(retorno));
          }
      });

  });  

app.get('/planetas/id=:id', function(req,res){
  var planetaDAO = new app.persistencia.PlanetaDAO();
  var swapi_interno = new app.servicos.Swapi_interno();

  if(!req.params.id){
    console.log('Campo "Id" nao preenchido!');  
    res.status(400).json('Campo "Id" nao preenchido!');
  }
   
  var memcachedClient = app.servicos.memcachedClient();

  memcachedClient.get('planeta-'+req.params.id.toString().toUpperCase(), function(error, retorno){
  
    if(error || !retorno){
        console.log('MISS - chave não encontrada');
        planetaDAO.buscaPorId(req.params.id, function(err, results){
          
        if(err){
           console.log(err);
           res.status(500).json(err);
           return;
         }
                        
         var novoItem = {};
         promise = new Promise((retorno, rej) =>{                  
           
          novoItem.id = results._id;  
          novoItem.nome = results.nome;  
          novoItem.clima = results.clima;
          novoItem.terreno = results.terreno;            
          novoItem.qtdFilmes = 0;              

          memcachedClient.get(
            'planeta-qtdFilmes-' + results.nome.toString().replace(/\s/g, "-").toUpperCase(), 
            function(erro, result){
              if(erro || !result){
                console.log('MISS - chave não encontrada');              

                retorno(novoItem);              
              }else {
                console.log('quantidade de filmes :' + result);
                novoItem.qtdFilmes = result;
                retorno(novoItem);              
              }
            });              
          //  swapi_interno.filmsByPlanet(results.nome, function(erro, quantidade){
               
          //   if(erro){
          //     rej(erro);
          //     return;
          //   }
    
          //   novoItem.qtdFilmes = quantidade;
          //      console.log('teste ' + results);                    
          //      retorno(novoItem);
          //  });           
    
         });
    
         promise
          .then(function(){        
            res.json(novoItem);
          })
          .catch(function(error){
             console.log(error);
             res.status(500).json(error);   
            });
       });   
    } else {
        res.json(retorno);
        console.log('HIT - valor: ' + JSON.stringify(retorno));
    }
  });  
  });  

  app.post('/planetas', function(req,res){
      
      var swapi_interno = new app.servicos.Swapi_interno();

      var planeta = req.body;
      
      req.assert('nome', 'Nome do planeta e obrigatório').notEmpty();            
      req.assert('clima', 'Clima do planeta e obrigatorio').notEmpty();
      req.assert('terreno', 'Terreno do planeta e obrigatorio').notEmpty();

      var erros = req.validationErrors();

      if(erros){          
          console.log('Erros de validacao encontrados')
          res.status(400).json(erros);                        
          return;
        }

      console.log('processando requisicao de planeta');

      var planetaDAO = new app.persistencia.PlanetaDAO();
      planetaDAO.salva(planeta, function(err, results){
        if(err){
          console.log(err);
          res.status(500).json(err);   
          return;
        }
        var novoItem = {};
        
        var memcachedClient = app.servicos.memcachedClient();

        promise = new Promise((resolve, reject) =>{                  
          
          novoItem.id = results._id;  
          novoItem.nome = results.nome;  
          novoItem.clima = results.clima;
          novoItem.terreno = results.terreno;            
          novoItem.qtdFilmes = 0;              
        
          memcachedClient.get('planeta-qtdFilmes-' + results.nome.toString().replace(/\s/g, "-").toUpperCase(), function(erro, result){
            if(erro || !result){
              console.log('planeta-qtdFilmes-' + results.nome.toString().replace(/\s/g, "-").toUpperCase());
              console.log('MISS - chave não encontrada');              

              resolve(novoItem);              
            }else {
              console.log('quantidade de filmes :' + result);
              novoItem.qtdFilmes = result;
              resolve(novoItem);              
            }

          } );    

        });

        promise
         .then(function(){
          
          var memcachedClient = app.servicos.memcachedClient(); 
          //Adiciona por nome
          memcachedClient.set(
              'planeta-' + novoItem.nome.toString().replace(/\s/g, "-").toUpperCase(), 
              novoItem,   
              0 /*never expires*/, 
              function(erro){
                if(erro){
                    console.log('Houve um problema ao setar o cache');
                    console.log(erro);
                    return;
                }
                console.log('Nova chave adicionada ao cache : ' + 'planeta-' + novoItem.nome.toString().replace(/\s/g, "-").toUpperCase());
              }
            )

          //Adiciona por Id
          memcachedClient.set(
            'planeta-' + novoItem.id.toString().toUpperCase(), 
            novoItem, 
            0 /*never expires*/, 
            function(erro){
              if(erro){
                  console.log('Houve um problema ao setar o cache');
                  return;
              }
              console.log('Nova chave adicionada ao cache : ' + 'planeta-' + novoItem.id.toString().toUpperCase());
            }
          );

          res.status(201).json(novoItem);
         })
         .catch(function(error){
            console.log(error);
            console.log("Ocorreu um erro");
            res.status(500).json(error);   
         });
      });      
  });

  app.delete('/planetas/id=:id', function(req,res){       
        var planetaDAO = new app.persistencia.PlanetaDAO();
        var memcachedClient = app.servicos.memcachedClient();
        planetaDAO.remove(req,res,memcachedClient);        
      });  
}
