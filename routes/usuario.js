var express = require('express');
var bcrypt = require('bcryptjs'); // Librería para encriptar la password
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

// ======================================================================================================
//                                      OBTENER TODOS LOS USUARIOS
// ======================================================================================================
app.get('/', (req, res, next) => {

    Usuario.find({}, // El {} para traer todo sin filtros
            'nombre email img role') // Campos a traer, no tiene sentido traer el password     
        .exec(
            (err, usuarios) => { // Callback de la respuesta

                if (err) { // Error de Mongo
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario',
                        errors: err
                    });
                }
                // La consulta es correcta
                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });

            });
});


// =================================================================================================
//                                      ACTUALIZAR UN USUARIO
// =================================================================================================

app.put('/:id', mdAutenticacion.verificaToke, (req, res) => {

    //Obtencion del id pasado por parametro
    var id = req.params.id;
    //Obtencion de los paramatros de la request
    var body = req.body; //SOLO FUNCIONA SI TENEMOS BODY PARSER INSTALADO

    //Obtenemos el usuario
    Usuario.findById(id, (err, usuario) => {

        if (err) { // Error de Mongo
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al busca usuario',
                errors: err
            });
        };

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id: ' + id + ' no existe',
                errors: { message: 'No existe un usuario con el id ' + id }
            });
        }
        // Si todo va bien actualizamos
        /* usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role; */
        //Otra forma de actualizar los datos
        Object.keys(req.body).forEach(key => {
            usuario[key] = req.body[key];
        });

        usuario.save((err, usuarioGuardado) => {
            if (err) { // Error de Mongo
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            };
            // Eliminamos la password
            usuarioGuardado.password = ':)';
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });

    });

});

// =======================================================================================================
//                                          CREAR UN NUEVO USUARIO
// =======================================================================================================
app.post('/', mdAutenticacion.verificaToke, (req, res) => {

    var body = req.body; //SOLO FUNCIONA SI TENEMOS BODY PARSER INSTALADO

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });
    // Recorrer el body para todos los datos. Habría que añadir if si fuera necesario modificar datos, p.e., encriptar
    /* var usuario = new Usuario();
    Object.keys(req.body).forEach(key => {
        usuario[key] = req.body[key];
    }); */
    console.log('Usuario a Crear: \x1b[32m%s\x1b[0m', usuario);
    // Para guardarlo
    usuario.save((err, usuarioGuardado) => {

        if (err) { // Error de Mongo
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el usuario',
                errors: err
            });
        };

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });
    });



});

// =================================================================================================
//                                      BORRAR UN USUARIO
// =================================================================================================

app.delete('/:id', mdAutenticacion.verificaToke, (req, res) => {

    //Obtencion del id pasado por parametro
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) { // Error de Mongo
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el usuario',
                errors: err
            });
        };

        if (!usuarioBorrado) { // Error de Mongo
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con el id: ' + id,
                errors: { message: 'No existe un usuario con el id: ' + id }
            });
        };

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });



});

module.exports = app;