const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");


function list(req, res, next) {
    res.status(200).json({ data: orders })
}

//
function create(req, res, next) {
    res.status(200).json({ data: orders })
}

//
function read(req, res, next) {
    res.status(200).json({ data: orders })
}

//
function update(req, res, next) {
    res.status(200).json({ data: orders })
}

//
function destroy(req, res, next) {
    res.status(200).json({ data: orders })
}


module.exports = {
    list,
    create,
    read,
    update,
    delete: [destroy],
}