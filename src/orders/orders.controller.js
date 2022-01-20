const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

// Helper Functions

function propretiesExist(req, res, next) {
    const {
        data: { deliverTo, mobileNumber, dishes },
    } = req.body;
    if (
        deliverTo &&
        mobileNumber &&
        dishes
    ) {
        const newOrder = {
            deliverTo: deliverTo,
            mobileNumber: mobileNumber,
            dishes: dishes,
            id: nextId(),
        };
        res.locals.newOrder = newOrder;
        return next();
    } else {
        return next({
            status: 400,
            message: "Something is missing! please make sure you entered the following: deliverTo, mobileNumber, dishes, quantity",
        });
    }
}

function validateDishes(req, res, next) {
    const { data: { dishes } } = req.body;
    if (Array.isArray(dishes) && dishes.length > 0) {
        return next();
    } else {
        return next({
            status: 400,
            message: "dishes is not an array or is an empty array!",
        });
    }

}

function validateQuantity(req, res, next) {
    const {
        data: { dishes },
    } = req.body;

    dishes.forEach((dish) => {
        const quantity = dish.quantity;
        if (!(quantity && quantity > 0 && Number.isInteger(quantity))) {
            next({
                status: 400,
                message: `quantity ${quantity} must be at least 1`,
            });
        }
    });
    return next();
}

function validateStatus(req, res, next) {
    const existingStatus = res.locals.foundOrder.status
    const { data: { status } } = req.body;
    if (status && existingStatus !== "delivered") {
        res.locals.newOrder.status = status
        return next();
    } else {
        next({
            status: 400,
            message: `status already delivered`,
        });
    }
}

function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
        res.locals.foundOrder = foundOrder;
        return next();
    } else {
        next({
            status: 404,
            message: `order ${orderId} was not found`,
        });
    }
}

function idMatches(req, res, next) {
    const {
        data: { id },
    } = req.body;
    const { orderId } = req.params;

    if (id) {
        id === orderId ?
            next() :
            next({
                status: 400,
                message: `${id} does not match the id: ${orderId}`,
            });
    }
    next();
}

// Route /orders

function list(req, res, next) {
    res.status(200).json({ data: orders });
}


function create(req, res, next) {
    const newOrder = res.locals.newOrder;
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}

// Route //orders/:orderId

function read(req, res, next) {
    const foundOrder = res.locals.foundOrder;
    res.status(200).json({ data: foundOrder });
}


function update(req, res, next) {
    let foundOrder = res.locals.foundOrder;
    const newOrder = res.locals.newOrder;
    const originalId = foundOrder.id;
    foundOrder = newOrder;
    foundOrder["id"] = originalId;
    res.status(200).json({ data: newOrder });
}

function destroy(req, res, next) {
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === orderId);
    if (orders[index].status === "pending") {
        const deletedOrder = orders.splice(index, 1);
        res.sendStatus(204);
    } else {
        next({
            status: 400,
            message: `An order cannot be deleted unless it is pending`,
        });
    }
}

module.exports = {
    list,
    create: [propretiesExist, validateDishes, validateQuantity, create],
    read: [orderExists, read],
    update: [orderExists, idMatches, propretiesExist, validateDishes, validateQuantity, validateStatus, update],
    delete: [orderExists, destroy],
};