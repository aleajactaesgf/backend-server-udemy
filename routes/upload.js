const express = require('express');

const fileUpload = require('express-fileupload');
const fs = require('fs');

const app = express();

const Usuario = require('../models/usuario');
const Medico = require('../models/medico');
const Hospital = require('../models/hospital');

//////////////////////////////////////////////////////////////////
//        Revisar https://github.com/mscdex/mmmagic             //
//        Librería para validar ficheros como obtener mime type //
//////////////////////////////////////////////////////////////////

// default options
app.use(fileUpload());


app.put('/:tipo/:id', (req, res, next) => {

    //Tipo es medico, hospital o usuario, a quien asignar la imagen
    //id del usuario para generar el nombre personalizado de la imagen
    var tipo = req.params.tipo;
    var id = req.params.id;

    //Validación tipo colección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo ' + tipo + ' no válida',
            errors: { message: 'Los tipos válidos ' + tiposValidos.join(', ') }
        });
    }

    //Valida si se ha envidado ficheros
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No ha seleccionado ficheros',
            errors: { message: 'Debe seleccionar una imagen' }
        });

    }
    // Obtenemos el nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    //var extension = nombreCortado.pop(); // pop() Remove the last element of an array
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension ' + extensionArchivo + ' no válida',
            errors: { message: 'Las extensiones válidas ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre archivo personalizado idUsuario+Random+extension
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo Movido!'
        // });

    });

});


function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {
            var pathViejo = '';
            //Validacion existe el usuario
            if (!usuario) {
                pathViejo = './uploads/usuarios/' + nombreArchivo;
                //La subida imagen la borramos
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No se encontro nada con ese Id de usuario',
                    errors: {
                        message: 'Debe selecionar un Id valido'
                    }
                });
            }

            pathViejo = './uploads/usuarios/' + usuario.img;
            //Si el usuario ya tiene imagen la borramos
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada!',
                    usuario: usuarioActualizado
                });
            });

        });

    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {
            var pathViejo = '';
            //Validacion existe el medico
            if (!medico) {
                pathViejo = './uploads/medicos/' + nombreArchivo;
                //La subida imagen la borramos
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No se encontro nada con ese Id de medico',
                    errors: {
                        message: 'Debe selecionar un Id valido'
                    }
                });
            }


            pathViejo = './uploads/medicos/' + medico.img;
            //Si el medico ya tiene imagen la borramos
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del medico actualizada!',
                    medico: medicoActualizado
                });
            });

        });

    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {
            var pathViejo = '';
            //Validacion existe el hospital
            if (!hospital) {
                pathViejo = './uploads/hospitales/' + nombreArchivo;
                //La subida imagen la borramos
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No se encontro nada con ese Id de hospital',
                    errors: {
                        message: 'Debe selecionar un Id valido'
                    }
                });
            }

            pathViejo = './uploads/hospitales/' + hospital.img;
            //Si el hospital ya tiene imagen la borramos
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del hospital actualizado!',
                    hospital: hospitalActualizado
                });
            });

        });
    }


}

module.exports = app;