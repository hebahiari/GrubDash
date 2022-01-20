const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed");
const controller = require("./dishes.controller");

route
    .router("/dishes")
    .get(controller.list)
    .post(controller.create)
    .all(methodNotAllowed);

route
    .router("/dishes/:dishId")
    .get(controller.read)
    .put(controller.update)
    .all(methodNotAllowed);

module.exports = router;