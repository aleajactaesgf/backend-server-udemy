var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// ======================================================================================================
//                                      VERIFICAR TOKEN - MIDDLEWARE
// ======================================================================================================

exports.verificaToke = function(req, res, next) {
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) { // Error de Mongo
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next(); // El next indica que continue el codigo

        // res.status(200).json({
        //     ok: true,
        //     decoded: decoded
        // });

    });
}

// ======================================================================================================
//                                      VERIFICAR ADMIN - MIDDLEWARE
// ======================================================================================================

exports.verificaADMIN_ROLE = function(req, res, next) {


    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return; // Este return es posible que no sea necesario
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador',
            errors: { message: 'No es administrador' }
        });
    }
}

// ======================================================================================================
//                                      VERIFICAR ADMIN ó MISMO USUARIO - MIDDLEWARE
// ======================================================================================================

exports.verificaADMIN_o_MismoUsuario = function(req, res, next) {


    var usuario = req.usuario;
    var id = req.params.id; // id que viene por parametro de la request

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return; // Este return es posible que no sea necesario
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador ni es el mismo usuario',
            errors: { message: 'No es administrador' }
        });
    }
}