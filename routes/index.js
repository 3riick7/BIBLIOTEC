const router = require('express').Router();

router.use('/libros', require('./libros'));
router.use('/socios', require('./socios'));
router.use('/prestamos', require('./prestamos'));

module.exports = router;
