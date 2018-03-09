// Requires - Importación de librerias
var express = require('express');
var colors = require('colors'); // https://github.com/marak/colors.js/
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


// Inicializar variables - Uso de las variables importadas
var app = express();

// Body Parser https://github.com/expressjs/body-parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importar Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');


// Conexion a la BBDD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err;

    console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'online');
});

// Rutas - Tipos de Peticiones a escuchar
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);





// Escuchar Peticiones para el servidor express
app.listen(3000, () => {
    console.log('Express puerto 3000: \x1b[32m%s\x1b[0m', 'online'); // Color de Fernando
    // console.log('Express puerto 3000:', colors.green('online'));

});