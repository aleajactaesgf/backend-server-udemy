var express = require('express');
var bcrypt = require('bcryptjs'); // Librería para des/encriptar la password
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

var mdAutenticacion = require('../middlewares/autenticacion');

// ======================================================================================================
//                                      RENOVACION TOKEN
// ======================================================================================================
app.get('/renuevatoken', mdAutenticacion.verificaToke, (req, res) => {

    var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 }); //Expira en 4 horas

    res.status(200).json({
        ok: false,
        token: token
    });
});


// ======================================================================================================
//                                      LOGIN GOOGLE
// ======================================================================================================

app.post('/google', (req, res) => {

    var token = req.body.token || '';

    const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET);
    const ticket = client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID
    });

    ticket.then(data => {

        Usuario.findOne({ email: data.payload.email }, (err, usuario) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario - login',
                    errors: err
                });
            }

            if (usuario) { // El usuario existe 
                if (usuario.google === false) { //El usuario no se dió de alta por autenticación por google
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Debe usar su autenticación normal'
                    });
                } else {
                    usuario.password = ':)'; //Eliminamos de la respuesta la password
                    var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); //Expira en 4 horas

                    res.status(200).json({
                        ok: true,
                        usuario: usuario,
                        token: token,
                        id: usuario._id,
                        menu: obtenerMenu(usuario.role)
                    });
                }
            } else { // Usuario no existe por correo

                var usuario = new Usuario();
                usuario.nombre = data.payload.name;
                usuario.email = data.payload.email;
                usuario.password = ':)';
                usuario.img = data.payload.picture;
                usuario.google = true;

                usuario.save((err, usuarioDB) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al crear usuario - google',
                            errors: err
                        });
                    }

                    usuarioDB.password = ':)'; //Eliminamos de la respuesta la password
                    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //Expira en 4 horas

                    res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB._id,
                        menu: obtenerMenu(usuarioDB.role)
                    });
                });

            }
        });


        /* res.status(200).json({
            ok: true,
            ticket: data.payload,
            userid: data.payload.sub
        }); */
    }).catch(err => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Token no válido',
                errors: err
            });
        }
    });


});



// ======================================================================================================
//                                      LOGIN NORMAL
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
            id: usuarioDB._id,
            menu: obtenerMenu(usuarioDB.role)
        });

    });
});


function obtenerMenu(ROLE) {

    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'Progress Bar', url: '/progress' },
                { titulo: 'Gráficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'RxJs', url: '/rxjs' }
            ]
        },
        {
            titulo: 'Mantenimientos',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                //{ titulo: 'Usuarios', url: '/usuarios'},
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Medicos', url: '/medicos' }
            ]
        }
    ];

    if (ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }

    return menu;
}

module.exports = app;