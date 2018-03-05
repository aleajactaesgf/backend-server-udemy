// Requires - Importación de librerias
var express = require('express');
var colors = require('colors'); // https://github.com/marak/colors.js/

var mongoose = require('mongoose');




// Inicializar variables - Uso de las variables importadas
var app = express();


// Conexion a la BBDD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err;

    console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'online');
});

// Rutas - Tipos de Peticiones a escuchar
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente!!'
    });

});




// Escuchar Peticiones para el servidor express
app.listen(3000, () => {
    console.log('Express puerto 3000: \x1b[32m%s\x1b[0m', 'online'); // Color de Fernando
    // console.log('Express puerto 3000:', colors.green('online'));

});