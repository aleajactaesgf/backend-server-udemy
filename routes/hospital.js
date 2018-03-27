var express = require('express');


var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// ======================================================================================================
//                                      OBTENER TODOS LOS HOSPITALES
// ======================================================================================================
app.get('/', (req, res, next) => {

    //Parametrizar el limit y star por el body o req
    let limit = req.query.limit || 5; // Desde el body sería req.body.limit
    let desde = req.query.desde || 0; // Desde el body sería req.body.start
    limit = Number(limit); //  Se fuerza a que sea numero
    desde = Number(desde); //  Se fuerza a que sea numero

    Hospital.find({})
        .skip(desde) // Se salte el numero de registro
        .limit(limit)
        .populate('usuario', 'nombre email') //Metodo de Mongoose para traer información de otra tabla indicando que campo 'usuario' y que campos de este
        .exec(
            (err, hospitales) => { // Callback de la respuesta

                if (err) { // Error de Mongo
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hopitales',
                        errors: err
                    });
                }
                // La consulta es correcta
                // Calculo del Total
                Hospital.count({}, (err, conteo) => {
                    if (err) { // Error de Mongo
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error Total hospital',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        total: conteo,
                        hospitales: hospitales
                    });

                });
            });
});


// =================================================================================================
//                                      ACTUALIZAR UN HOSPITAL
// =================================================================================================

app.put('/:id', mdAutenticacion.verificaToke, (req, res) => {

    //Obtencion del id pasado por parametro
    var id = req.params.id;
    //Obtencion de los paramatros de la request
    var body = req.body; //SOLO FUNCIONA SI TENEMOS BODY PARSER INSTALADO

    //Obtenemos el hospital
    Hospital.findById(id, (err, hospital) => {

        if (err) { // Error de Mongo
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        };

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id: ' + id + ' no existe',
                errors: { message: 'No existe un hospital con el id ' + id }
            });
        }
        // Si todo va bien actualizamos
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id; //Acualizamos el usuario conectado

        hospital.save((err, hospitalGuardado) => {
            if (err) { // Error de Mongo
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            };
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });

    });

});

// =======================================================================================================
//                                          CREAR UN NUEVO HOSPITAL
// =======================================================================================================
app.post('/', mdAutenticacion.verificaToke, (req, res) => {

    var body = req.body; //SOLO FUNCIONA SI TENEMOS BODY PARSER INSTALADO

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    // Para guardarlo
    hospital.save((err, hospitalGuardado) => {

        if (err) { // Error de Mongo
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el hospital',
                errors: err
            });
        };

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });



});

// =================================================================================================
//                                      BORRAR UN HOSPITAL
// =================================================================================================

app.delete('/:id', mdAutenticacion.verificaToke, (req, res) => {

    //Obtencion del id pasado por parametro
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) { // Error de Mongo
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el hospital',
                errors: err
            });
        };

        if (!hospitalBorrado) { // Error de Mongo
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con el id: ' + id,
                errors: { message: 'No existe un hospital con el id: ' + id }
            });
        };

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });



});

module.exports = app;