var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ======================================================================================================
//                                      BUSQUEDA POR COLECCION
// ======================================================================================================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    // Obtenemos los parametros
    let tabla = req.params.tabla;
    let busqueda = req.params.busqueda;
    // Para añadir like a la busqueda no sensitive a la mayusculas y minusculas
    let regex = new RegExp(busqueda, 'i'); //'i' no sensitive

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda son: usuarios, medicos y hospitales',
                error: { message: 'Tipo tabla/coleccion no válida' }
            });
    }


    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data // ES6 propiedades de objeto computadas por eso pone los corchetes para obtener el valor
        });
    });


});

// ======================================================================================================
//                                      BUSQUEDA GENERAL: EN TODAS LAS COLECCIONES
// ======================================================================================================
app.get('/todo/:busqueda', (req, res, next) => {

    // Obtenemos los parametros
    let busqueda = req.params.busqueda;
    // Para añadir like a la busqueda no sensitive a la mayusculas y minusculas
    let regex = new RegExp(busqueda, 'i'); //'i' no sensitive

    // La consulta en varias colecciones se realiza con procesos asincronos y esperar que terminen
    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => { //respuestas es un array en la misma posicion que el array de promesas del all(....)
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });
});

// ======================================================================================================
//                                      PROMESA FILTRAR HOSPITALES
// ======================================================================================================
function buscarHospitales(busqueda, regex) {

    // Retornamos un promesa
    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .exec((err, hospitales) => {

                // Si hay error retorno un mensaje y no un res
                if (err) {
                    reject('Promise - Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            })
    });
}
// ======================================================================================================
//                                      PROMESA FILTRAR MEDICOS
// ======================================================================================================
function buscarMedicos(busqueda, regex) {

    // Retornamos un promesa
    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .populate('hospital')
            .exec((err, medicos) => {

                // Si hay error retorno un mensaje y no un res
                if (err) {
                    reject('Promise - Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            })

    });
}

// ======================================================================================================
//                                      PROMESA FILTRAR USUARIOS - DOS COLUMNAS
// ======================================================================================================
function buscarUsuarios(busqueda, regex) {

    // Retornamos un promesa
    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role img') // Algunos campos
            .or([{ 'nombre': regex }, { 'email': regex }]) // Busqueda en dos columnas con el or
            .exec((err, usuarios) => {
                // Si hay error retorno un mensaje y no un res
                if (err) {
                    reject('Promise - Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });

    });
}

module.exports = app;