const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();



app.post('/login', (req, res) => {

    let body = req.body;

    /*findOne() Deseo encontrar el user que haga match con el body en el request. Puedo especificar una 
    condicion entre {condition} "The conditions are cast to their respective SchemaTypes
     before the command is sent."  */
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        } else if (!usuarioDB) {

            return res.status(400).json({
                ok: false,
                err: { mensaje: 'Usuario incorrectos' }
            });

        };
        /*Evaluando contrasena. Vamos a tomar la contrasena que ha sido encriptada al crear el 
        usuario, y la vamos a volver a encriptar para ver si hace match con la contrasena
        creada en la BD*/
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {

            return res.status(400).json({
                ok: false,
                err: { mensaje: 'contrasena incorrecta' }
            });

        };

        let token = jwt.sign({
            //payload
            usuario: usuarioDB
        }, process.env.SEED_PROD, { expiresIn: process.env.EXPDATE_TOKEN });

        /*Al verificar que el usuario y contrasena hacen match */
        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });



    });
});


module.exports = app