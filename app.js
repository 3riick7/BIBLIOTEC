require('dotenv').config();
const express = require('express');
const path = require('path');
const config = require('./config/config');
const logger = require('./middleware/logger');
const { noEncontrado, manejarErrores } = require('./middleware/errores');
const rutas = require('./routes');

const app = express();
app.use(express.json());
app.use(logger);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', rutas);
app.use(noEncontrado);
app.use(manejarErrores);

if (require.main === module) {
  app.listen(config.puerto, () => {
    console.log(`${config.nombre} activo en http://localhost:${config.puerto}`);
  });
}
module.exports = app;
