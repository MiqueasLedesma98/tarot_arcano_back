const Router = require("express");

const { transaction: controller } = require("../controllers");

const { validateJWT } = require("../middlewares");

const router = Router();

router.get("/list", [validateJWT], controller.getTransactions);

router.post("/", [validateJWT], controller.newTransaction);

router.

module.exports = router;
