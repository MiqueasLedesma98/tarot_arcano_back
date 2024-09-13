// Librarys
const Router = require("express");
const { check } = require("express-validator");

// Middlewares
const { validateJWT, validationErrors } = require("../middlewares");

// Controller
const { review: controller } = require("../controllers");

const router = Router();

router.get(
  "/:id",
  [
    validateJWT,
    check("id", "Debe ser un ID válido").notEmpty().isMongoId(),
    validationErrors,
  ],
  controller.getTen
);

module.exports = router;
