//libreria para montar servidor
const express = require('express');
//Para encriptar passwords
const bcrypt = require('bcrypt');
//Expande funciones que javascript no tiene
const _ = require('underscore');
const Usuario = require('../models/usuario');
const { verifyToken, verifyAdminRole } = require('../middlewares/autenticacion');
const app = express();
/*Estoy indicando que verifyToken es el middleware que se va a ejecutar cuando quiera
accesar o cuando quiera revisar esa ruta */
app.get('/usuario', [verifyToken, verifyAdminRole], function(req, res) {



    /*hacer GET de la DB de todos los usuario con el metodo find() de mongoose y luego utilizar
    el metodo exec() para ejecutar lo encontrado por find()*/
    /*Parametro Query para indicar desde donde y hasta donde quiero la info */
    let desde = Number(req.query.desde) || 0;
    let limite = Number(req.query.limite) || 2;
    let estatus = true


    /*Filtrando los campos que seran regresados de la solicitud GET, en el .find() como segundo
    parametro ingresamos un 'string' como condicion especial definiendo campos o propiedades
    que queremos regresar */
    Usuario.find({ estado: estatus }, 'nombre estado role')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.count({ estado: estatus }, (err, conteo) => {

                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                })
            })



        })
})

app.post('/usuario', [verifyToken, verifyAdminRole], function(req, res) {




    // recibiendo la info del POST
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        //Encrypt de manera sincrona, directa.
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    })

    /*Grabarlo en la DB con save que es keyword de mongoose,
recibo un err o un usuario de la DB. resp del user que se grabo
en mongoDB*/
    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //usuarioDB.password = null;
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

app.put('/usuario/:id', [verifyToken, verifyAdminRole], function(req, res) {



    let id = req.params.id;
    //Elige el content del body arg1 y el arg2 las propiedades validas qe si se pueden modificar
    let arr = ['nombre', 'email', 'img', 'role', 'estado']
    let body = _.pick(req.body, arr);



    //el obj {new : true} es para devolverle al usuario el objecto modificado de la DB
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        /*El usuarioDB aparte de venir de la DB tambien tiene el Schema de Usuario por lo tanto
        tiene metodos como 'usuarioDB.save' lo cual es de mongoose. Lo que queremos es guardar
        la actualizacion que se le hizo a ese usuario. */
        //usuarioDB.save
        /*Como segunda opcion esta findByIdAndUpdate de mongoose */
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        })
    })
});

app.delete('/usuario/:id', [verifyToken, verifyAdminRole], function(req, res) {




    let id = req.params.id;
    let cambiarEstado = { estado: false }

    Usuario.findByIdAndUpdate(id, cambiarEstado, { new: true }, (err, usuarioBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        } else if (!usuarioBorrado) {

            return res.status(400).json({
                ok: false,
                err: {
                    mensaje: 'usuario no encontrado'
                }
            });

        };

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });

    });
});

module.exports = app