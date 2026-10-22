const router = require('express').Router();
const c = require('../controllers/ReporteController');

router.get('/resumen', c.resumen);

module.exports = router;
