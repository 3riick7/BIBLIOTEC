const router = require('express').Router();

router.use('/libros', require('./libros'));
router.use('/socios', require('./socios'));
router.use('/prestamos', require('./prestamos'));
router.use('/reportes', require('./reportes'));

module.exports = router;
