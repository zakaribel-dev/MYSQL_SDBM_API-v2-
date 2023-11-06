var express = require('express');
var mysql = require('mysql');
var app = express(); 

const bodyParser = require('body-parser'); // Obligatoire pour les method post et put
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


var connection = mysql.createPool({ 
// creer un pool de connexion pour maintenir les connexions au 
//lieu de les détruire à chaque requete sql c pour améliorer les perfs!!
    connectionLimit: 50,
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'sdbm_v2'
});


//app.all('*', function (req, res, next) {
//    res.header('Access-Control-Allow-Origin', '*');
//    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
//    res.header('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
//    next();
//});
/**********************************************************************
 **********************************************************************
 *********                 Les ROUTES                   ***************
 **********************************************************************
 **********************************************************************/
/***********     Les ARTICLES       ************************************/

app.get('/articles/:id', function (req, resp) {
    console.log(req.params.id);
    requete(connection, req, resp, "select * from article where ID_ARTICLE = " + req.params.id )
});


app.route('/articles')
    .get(function (req, resp) {
        getRequest(connection, req, resp, "select * from article")
    })
    .post(function (req, res) {
        console.log(req);
        console.log(req.params.ID_ARTICLE);
        // var isbn = req.params.isbn;
        // var titre = req.params.titre;
        // var theme = req.params.theme;
        // res.send(req);
        res.send('insert the article');
    })
    .put(function (req, res) {
        res.send('Update the article');
    })
    .delete(function (req, res) {
        res.send('delete the article');
    });

/***********     Les PAYS      ************************************/
app.get('/pays/:id', function (req, resp) {
    console.log(req.params.id);
    getRequest(connection, req, resp, "select * from pays where ID_PAYS = " + req.params.id )
});



app.route('/pays')
    .get(function (req, resp) {
        getRequest(connection, req, resp, "select * from pays")
    })

    .post(function (req, res) {
        const sql = "INSERT INTO pays (NOM_PAYS, ID_CONTINENT) VALUES ('" + req.body.NOM_PAYS + "', " + req.body.ID_CONTINENT + ")";
        sendRequest(connection, req, res, sql, 'Pays: ' + req.body.NOM_PAYS + ' ajouté !');
    })
    
    .put(function (req, res) {
        const sql = "UPDATE pays SET NOM_PAYS = '" + req.body.NOM_PAYS + "', ID_CONTINENT = " + req.body.ID_CONTINENT + " WHERE ID_PAYS = " + req.body.ID_PAYS;
        sendRequest(connection, req, res, sql, 'Le pays est modifié en : ' + req.body.NOM_PAYS);
    })
    
    .delete(function (req, res) {
        const sql = "DELETE FROM pays WHERE ID_PAYS = " + req.body.ID_PAYS;
        sendRequest(connection, req, res, sql, 'Pays supprimé numéro ' + req.body.ID_PAYS);
    });

/*********************************************************************
 **********************************************************************
 *********                 Les FONCTIONS                ***************
 **********************************************************************
 **********************************************************************/
function getRequest(cnn, req, resp, sql) { // Fonction dédiée à la méthode GET !
    console.log('requete : '+sql);
    cnn.getConnection(function (error, tempCont) {
        if (!!error) {
            // je rends la connexion qui retourne dans sa pool si ya un erreur
            tempCont.release(); 
            console.log('Error');
        } else {
            console.log('connecté');
            tempCont.query(sql, function (error, rows, fields) {
                tempCont.release();
                if (!!error) {
                    console.log("erreur dans la requete");
                } else {
                        resp.json(rows);
                        console.log('requete OK');
               }
            })
        }
    });
}


function sendRequest(cnn, req, res, sql,msg) { // Fonction dédiée au reste du crud
    console.log('requete : '+sql);
    cnn.getConnection(function (error, tempCont) {
        if (!!error) {
            tempCont.release();
            console.log('Error');
        } else {
            console.log('connecté');


            tempCont.query(sql, function (error, rows, fields) {
                tempCont.release();
                if (!!error) {
                    console.log("erreur dans la requete");
                } else {
                    res.send(msg);
                }
            })
        }
    });
}

/**********************************************************************
 **********************************************************************
 *********               Lancement du serveur           ***************
 **********************************************************************
 **********************************************************************/
app.listen(3);
console.log('On ecoute le port 3');


