var express = require('express');


var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// ======================================================================================================
//                                      OBTENER TODOS LOS MEDICOS
// ======================================================================================================
app.get('/', (req, res, next) => {

    //Parametrizar el limit y star por el body o req
    let limit = req.query.limit || 5; // Desde el body sería req.body.limit
    let desde = req.query.desde || 0; // Desde el body sería req.body.start
    limit = Number(limit); //  Se fuerza a que sea numero
    desde = Number(desde); //  Se fuerza a que sea numero

    Medico.find({})
        .skip(desde) // Se salte el numero de registro
        .limit(limit)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => { // Callback de la respuesta

                if (err) { // Error de Mongo
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }
                // La consulta es correcta
                // Calculo del Total
                Medico.count({}, (err, conteo) => {
                    if (err) { // Error de Mongo
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error Total medico',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        total: conteo,
                        medicos: medicos
                    });

                });





            });
});


// =================================================================================================
//                                      ACTUALIZAR UN MEDICO
// =================================================================================================

app.put('/:id', mdAutenticacion.verificaToke, (req, res) => {

    //Obtencion del id pasado por parametro
    var id = req.params.id;
    //Obtencion de los paramatros de la request
    var body = req.body; //SOLO FUNCIONA SI TENEMOS BODY PARSER INSTALADO

    //Obtenemos el medico
    Medico.findById(id, (err, medico) => {

        if (err) { // Error de Mongo
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        };

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id: ' + id + ' no existe',
                errors: { message: 'No existe un medico con el id ' + id }
            });
        }
        // Si todo va bien actualizamos
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) { // Error de Mongo
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            };
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });

    });

});

// =======================================================================================================
//                                          CREAR UN NUEVO MEDICO
// =======================================================================================================
app.post('/', mdAutenticacion.verificaToke, (req, res) => {

    var body = req.body; //SOLO FUNCIONA SI TENEMOS BODY PARSER INSTALADO

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    // Para guardarlo
    medico.save((err, medicoGuardado) => {

        if (err) { // Error de Mongo
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el medico',
                errors: err
            });
        };

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });



});

// =================================================================================================
//                                      BORRAR UN MEDICO
// =================================================================================================

app.delete('/:id', mdAutenticacion.verificaToke, (req, res) => {

    //Obtencion del id pasado por parametro
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) { // Error de Mongo
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el medico',
                errors: err
            });
        };

        if (!medicoBorrado) { // Error de Mongo
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con el id: ' + id,
                errors: { message: 'No existe un medico con el id: ' + id }
            });
        };

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });



});

module.exports = app;