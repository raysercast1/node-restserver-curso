const express = require('express');
const Producto = require('../models/producto');
const _ = require('underscore');
const { verifyToken, verifyAdminRole } = require('../middlewares/autenticacion');
let app = express();





/* traer todos los productos y utilizar populate con usuario y categoria. Que este paginado */
app.get('/producto', (req, res) => {

    let disponibles = { disponible: true }
    Producto.find(disponibles)
        .populate('usuario', 'email role')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) return res.status(500).json({ ok: false, err });
            if (!productoDB) return res.status(400).json({ ok: false, err: { mnsj: 'No hay producto en DB' } });

            Producto.count((err, conteo) => {
                if (err) return res.json({ ok: false, err });
                res.status(200).json({ ok: true, conteo, productoDB });
            });
        });
});


/*Usar populate: usuario, categoria */
app.get('/producto/:id', [verifyToken, verifyAdminRole], (req, res) => {

    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'email role')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) return res.status(500).json({ ok: false, err });
            if (!productoDB) return res.status(400).json({ ok: false, err: { mnsj: 'Producto no encontrado' } });
            res.status(200).json({ ok: true, productoDB });
        });

});

//Buscar producto

app.get('/producto/buscar/:termino', verifyToken, (req, res) => {

    let termino = req.params.termino;
    let regEx = new RegExp(termino, 'i');

    Producto.find({ descripcion: regEx })
        .populate('usuario', 'email role')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) return res.status(500).json({ ok: false, err });
            res.status(200).json({ ok: true, productos });

        });
});


/*Crear un producto, grabar usuario y categoria del listado que ya tenemos */
app.post('/producto', [verifyToken, verifyAdminRole], (req, res) => {

    let id = req.usuario._id
    let body = req.body;

    let producto = new Producto({
        usuario: id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        categoria: body.categoria,
        descripcion: body.descripcion

    });

    producto.save((err, productoDB) => {
        if (err) return res.status(500).json({ ok: false, err });
        if (!productoDB) return res.status(400).json({ ok: false, err: { mnsj: 'No se pudo guardar en DB' } });
        res.status(200).json({ ok: true, productoDB });

    });
});



app.put('/producto/:id', [verifyToken, verifyAdminRole], (req, res) => {

    let id = req.params.id;
    let opts = { new: true }
    let toUpDate = ['nombre', 'precioUni', 'descripcion', 'disponible']
    let toBeUpdated = _.pick(req.body, toUpDate);

    Producto.findByIdAndUpdate(id, toBeUpdated, opts, (err, productoDB) => {
        if (err) return res.status(500).json({ ok: false, err });
        if (!productoDB) return res.json({ ok: false, err: { msnj: 'No se pudo actualizar producto' } });
        res.status(200).json({ ok: true, productoDB });
    });

});

/* Cambiar el estado de True/False del producto */
app.delete('/producto/:id', (req, res) => {

    let id = req.params.id;
    let disponibilidad = { disponible: false }
    let opts = { new: true }

    Producto.findByIdAndUpdate(id, disponibilidad, opts, (err, productoDB) => {
        if (err) return res.status(500).json({ ok: false, err });
        if (!productoDB) return res.json({ ok: false, err: { mnsj: 'Producto no encontrado' } });
        res.status(200).json({ ok: true, productoDB });
    });


});

module.exports = app