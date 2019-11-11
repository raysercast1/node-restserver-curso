const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


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

//Configuracion google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.nombre,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}


app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                err
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: { mensaje: 'Ya estas registrado con otras credenciales' }

                });
            } else {

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED_PROD, { expiresIn: process.env.EXPDATE_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {
            //Si el usuario no existe en DB
            let usuario = new Usuario();

            usuario.nombre = 'googleUser.nombre';
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = 'HappyFace';

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                };

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED_PROD, { expiresIn: process.env.EXPDATE_TOKEN });

                res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });

            });

        }

    });


    /*res.status(200).json({
        usuario: googleUser
    }); */
});

module.exports = app