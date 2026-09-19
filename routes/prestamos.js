const router = require('express').Router();
const c = require('../controllers/PrestamoController');

router.get('/', c.listar);
router.get('/atrasados', c.atrasados);
router.post('/', c.prestar);
router.put('/:id/devolver', c.devolver);

module.exports = router;
