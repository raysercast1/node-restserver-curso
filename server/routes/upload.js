const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');

/*default options. Ejecuta esta func middleware y todos los archivos que se cargan llegaran a
req.files */
app.use(fileUpload());

app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) return res.status(400)
        .json({ ok: false, msnj: 'No files were uploaded.' });


    // validando tipos de parametros aceptados
    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) return res.status(400)
        .json({ ok: false, mnsj: `Las extensiones validas son ${tiposValidos}` });

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.archivo;
    let splitted = sampleFile.name.split('.')
    let extension = splitted[splitted.length - 1];

    //Extensiones permitidas
    let extensionesValidad = ['png', 'jgp', 'gif', 'jpeg'];

    if (extensionesValidad.indexOf(extension) < 0) return res.status(400)
        .json({ ok: false, mnsj: 'Extensiones validas: ' + extensionesValidad.join(','), ext: extension });

    /*Cambiar nombre al archivo que viene de params. */
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(`./uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err) return res.status(500)
            .json({ ok: false, err });

        if (tipo == 'usuarios') {
            //Aca ya la imagen esta en el file-system. (imagen cargada)
            imagenUsuario(id, res, nombreArchivo);
        };
        if (tipo == 'productos') {
            imagenProducto(id, res, nombreArchivo)
        };


    });


});

function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {
            borrarArchivo(nombreArchivo, 'usuarios');
            return res.status(500)
                .json({ ok: false, err });
        }

        if (!usuarioDB) {
            borrarArchivo(nombreArchivo, 'usuarios');
            return res.status(400)
                .json({ ok: false, err: { mnsj: 'El usuario no se encuentra registrado en DB ' } });
        }


        borrarArchivo(usuarioDB.img, 'usuarios');


        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioDBSave) => {

            if (err) return res.status(500)
                .json({ err });

            res.json({ ok: true, usuario: usuarioDBSave, img: nombreArchivo });

        });

    });

};

function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id)
        .populate('usuario', {})
        .exec((err, productoDB) => {
            if (err) return res.json({ ok: false, err });
            if (!productoDB) return res.json({ ok: false, mnsj: 'No existe producto en BD' });

            borrarArchivo(productoDB.img, 'productos');

            productoDB.img = nombreArchivo;

            productoDB.save((err, productoDBSaved) => {
                if (err) return res.json({ ok: false, err });
                res.json({ ok: true, producto: productoDBSaved });
            });

        });


};

function borrarArchivo(nombreImg, tipo) {

    let pathImg = path.resolve(__dirname, `../../uploads/'${tipo}'/${nombreImg}`);
    if (fs.existsSync(pathImg)) {
        fs.unlinkSync(pathImg);
    };


};


module.exports = app