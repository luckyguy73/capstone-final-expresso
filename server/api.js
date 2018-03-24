// Import expressjs and create route handler
const express = require('express');
const apiRouter = express.Router();

// Mount route handler modules
const employees = require('./routers/employees');
apiRouter.use('/employees', employees);

const menus = require('./routers/menus');
apiRouter.use('/menus', menus);

// Export module
module.exports = apiRouter;
