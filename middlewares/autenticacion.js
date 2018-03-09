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