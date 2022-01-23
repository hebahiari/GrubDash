const path = require("path");
const { send } = require("process");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

//Helper Functions

function propertiesExist(req, res, next) {
    const {
        data: { name, description, image_url, price },
    } = req.body;
    const values = { name, description, image_url, price };


    for (const [key, value] of Object.entries(values)) {
        if (!value) {
            return next({
                status: 400,
                message: `Something is missing! Dish must include ${key}`,
            });
        }


    }
    //create a new dish 
    const newDish = {
        description: description,
        name: name,
        price: price,
        image_url: image_url,
        id: nextId(),
    };
    res.locals.newDish = newDish;
    return next();
}

function validatePrice(req, res, next) {
    const price = res.locals.newDish.price
    if (price <= 0 || !Number.isInteger(price)) {
        return next({
            status: 400,
            message: `Dish must have a price that is an integer greater than 0`,
        });
    } else {
        return next();
    }

}

function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
        res.locals.foundDish = foundDish;
        return next();
    } else {
        next({ status: 404, message: `Dish does not exist: ${dishId}` });
    }
}

function idMatches(req, res, next) {
    const {
        data: { id },
    } = req.body;
    const { dishId } = req.params;

    if (id) {
        id === dishId ?
            next() :
            next({
                status: 400,
                message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
            });
    }
    next();
}

// Route "/dishes"
function list(req, res) {
    res.status(200).json({ data: dishes });
}

function create(req, res) {
    const newDish = res.locals.newDish;
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

// Route "dishes/:dishId"
function read(req, res) {
    const foundDish = res.locals.foundDish;
    res.status(200).json({ data: foundDish });
}

//
function update(req, res) {
    let foundDish = res.locals.foundDish;
    const newDish = res.locals.newDish;
    const originalId = foundDish.id;
    foundDish = newDish;
    foundDish["id"] = originalId;
    res.status(200).json({ data: newDish });
}

module.exports = {
    list,
    create: [propertiesExist, validatePrice, create],
    read: [dishExists, read],
    update: [dishExists, propertiesExist, validatePrice, idMatches, update],
};