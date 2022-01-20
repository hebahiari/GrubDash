const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed");
const controller = require("./orders.controller");

route
    .router("/orders")
    .get(controller.list)
    .post(controller.create)
    .all(methodNotAllowed);

route
    .router("/orders/:orderId")
    .get(controller.read)
    .put(controller.update)
    .delete(controller.delete)
    .all(methodNotAllowed);

module.exports = router;