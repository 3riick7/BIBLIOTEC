const router = require('express').Router();
const c = require('../controllers/LibroController');

router.get('/', c.listar);
router.get('/categorias', c.categorias);
router.get('/:id', c.obtener);
router.post('/', c.crear);
router.post('/:id/portada', c.subirPortada);
router.put('/:id', c.actualizar);
router.delete('/:id', c.eliminar);

module.exports = router;
