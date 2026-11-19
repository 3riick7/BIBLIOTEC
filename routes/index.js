const router = require('express').Router();

router.use('/libros', require('./libros'));
router.use('/socios', require('./socios'));
router.use('/prestamos', require('./prestamos'));
router.use('/reportes', require('./reportes'));
router.use('/multas', require('./multas'));
router.use('/reservas', require('./reservas'));

module.exports = router;
