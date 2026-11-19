const router = require('express').Router();
const c = require('../controllers/MultaController');

router.get('/', c.listar);
router.put('/:id/pagar', c.pagar);

module.exports = router;
