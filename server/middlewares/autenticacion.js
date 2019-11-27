const jwt = require('jsonwebtoken');
//Verificar token
// next continua con la ejecucion del programa
let verifyToken = (req, res, next) => {
    //obteniendo headers del request
    //Como parametro del get viene el nombre del header que estoy buscando
    let token = req.get('token');
    //decoded es el payload o info del usuario
    jwt.verify(token, process.env.SEED_PROD, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err,
                mensaje: 'Token no valido'
            });
        };

        /*La idea es que todas las peticiones que pasan el jwt.verify(...) puedan acceder a la info del 
        usuario. En el objeto encriptado viene un key con nombre usuario.
        req.usuario es una nueva propiedad creada por mi */
        req.usuario = decoded.usuario;
        next();

    });

};

let verifyAdminRole = (req, res, next) => {

    let usuario = req.usuario.role;

    if (usuario === 'ADMIN_ROLE') {

        next();

    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'rol no valido'
        });
    };
};

let verifyTokenImg = (req, res, next) => {

    let token = req.query.token;

    jwt.verify(token, process.env.SEED_PROD, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err,
                mensaje: 'Token no valido'
            });
        };

        /*La idea es que todas las peticiones que pasan el jwt.verify(...) puedan acceder a la info del 
        usuario. En el objeto encriptado viene un key con nombre usuario.
        req.usuario es una nueva propiedad creada por mi */
        req.usuario = decoded.usuario;
        next();

    });

};



module.exports = {
    verifyToken,
    verifyAdminRole,
    verifyTokenImg
}