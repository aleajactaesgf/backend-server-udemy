var express = require('express');
var bcrypt = require('bcryptjs'); // Librería para des/encriptar la password
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

// ======================================================================================================
//                                      LOGIN
// ======================================================================================================

app.post('/', (req, res) => {

    var body = req.body; //SOLO FUNCIONA SI TENEMOS BODY PARSER INSTALADO

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) { // Error de Mongo
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Usuarios',
                errors: err
            });
        };
        // Sino existe
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email'
            });
        }
        // Verificación de la password
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password'
            });
        }

        //Crear Token
        usuarioDB.password = ':)'; //Eliminamos de la respuesta la password
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //Expira en 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });

    });
});




module.exports = app;