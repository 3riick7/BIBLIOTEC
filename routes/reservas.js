const router = require('express').Router();
const c = require('../controllers/ReservaController');

router.get('/', c.listar);
router.post('/', c.reservar);
router.put('/:id/cancelar', c.cancelar);

module.exports = router;
