const path = require("path");
const { send } = require("process");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

//Helper Functions

function validateDataPropreties(req, res, next) {
    const {
        data: { name, description, image_url, price },
    } = req.body;
    const values = { name, description, image_url, price };

    //check that all propreties exist
    for (const [key, value] of Object.entries(values)) {
        if (!value) {
            return next({
                status: 400,
                message: `Something is missing! Dish must include ${key}`,
            });
        }
        //check if price is an interger larger than 0
        if (key === "price" && (value <= 0 || !Number.isInteger(value))) {
            return next({
                status: 400,
                message: `Dish must have a price that is an integer greater than 0`,
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
    res.locals.newdish = newDish;
    return next();
}

function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
        res.locals.founddish = foundDish;
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
                message: `${id} does not match the id: ${dishId}`,
            });
    }
    next();
}

// Route "/dishes"
function list(req, res, next) {
    res.status(200).json({ data: dishes });
}

function create(req, res, next) {
    const newDish = res.locals.newdish;
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

// Route "dishes/:dishId"
function read(req, res, next) {
    const foundDish = res.locals.founddish;
    res.status(200).json({ data: foundDish });
}

//
function update(req, res, next) {
    let foundDish = res.locals.founddish;
    const newDish = res.locals.newdish;
    const originalId = foundDish.id;
    foundDish = newDish;
    foundDish["id"] = originalId;
    res.status(200).json({ data: newDish });
}

module.exports = {
    list,
    create: [validateDataPropreties, create],
    read: [dishExists, read],
    update: [dishExists, validateDataPropreties, idMatches, update],
};