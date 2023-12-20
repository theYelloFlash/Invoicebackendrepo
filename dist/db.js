"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
function db() {
    return (0, mongoose_1.connect)('mongodb://localhost:27017/invoice').
        then(() => {
        console.log("Mongodb connected");
    }).catch((error) => {
        console.log(error);
    });
}
exports.default = db;
