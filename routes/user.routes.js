const Router = require("express");

const { check: _ } = require("express-validator");

const { validateJWT, validationErrors } = require("../middlewares");

const { user: controller } = require("../controllers");

const router = Router();

// TODO: Terminar válidaciones
router.put("/update", [validateJWT, validationErrors], controller.update);

module.exports = router;
