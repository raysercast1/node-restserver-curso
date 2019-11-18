const express = require('express');
const _ = require('underscore');
let { verifyToken, verifyAdminRole } = require('../middlewares/autenticacion');
let app = express();
let Categoria = require('../models/categorias');


//Mostrar todas las categorias
app.get('/categoria', verifyToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'email role')
        .exec((err, categoriaDB) => {
            if (err) return res.status(400).json({ ok: false, err: { mensaje: 'no hay ninguna categoria creada' } });

            Categoria.count((err, conteo) => {
                if (err) return err
                res.json({ ok: true, categoriaDB, cuantos: conteo });
            });
        });
});

//Mostrar categoria por ID. Que aparezca la info de la categoria en particular
app.get('/categoria/:id', verifyToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if (err) return res.status(500).json({ ok: false, err });
        if (!categoriaDB) return res.status(400).json({ ok: false, err: { mensaje: 'categoria no encontrada' } });
        res.json({ ok: true, category: categoriaDB });
    });

});


//Crear nueva categoria

app.post('/categoria', verifyToken, (req, res) => {
    //regresa nueva catgoria
    let id = req.usuario._id
    let body = req.body;
    let categoria = new Categoria({
        usuario: id,
        descripcion: body.descripcion
    });

    categoria.save((err, categoriaDB) => {
        if (err) return res.status(500).json({ ok: false, err });
        if (!categoriaDB) return res.status(400).json({ ok: false, err });
        res.status(200).json({ ok: true, category: categoriaDB });
    });


});

app.put('/categoria/:id', [verifyToken, verifyAdminRole], (req, res) => {

    let id = req.params.id;
    let infoToUpdate = ['descripcion'];
    let toBeUpdate = _.pick(req.body, infoToUpdate);
    let opts = { new: true };

    Categoria.findByIdAndUpdate(id, toBeUpdate, opts, (err, categoriaDB) => {
        if (err) return res.status(500).json({ ok: false, err });
        if (!categoriaDB) return res.status(400).json({ ok: false, err });
        res.json({ ok: true, category: categoriaDB });
    });

});

app.delete('/categoria/:id', [verifyToken, verifyAdminRole], (req, res) => {
    //solo puedo ser borradar por ADMIN_ROLE
    let id = req.params.id;
    //Tiene que pedir el token
    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) return res.status(500).json({ ok: false, err });
        res.json({ ok: true, category: categoriaDB, mensaje: 'categoria borrada' });
    });
});



module.exports = app;