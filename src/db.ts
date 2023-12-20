import mongoose, {Schema, Model, connect} from "mongoose";

function db(){
    return connect('mongodb://localhost:27017/invoice').
    then(() => {
        console.log("Mongodb connected");
    }).catch((error : any) => {
        console.log(error);
    })
}

export default db;