var express = require("express");
var app = express();
const PORT=3000; 

// ---------------------
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
// ---------------------

const status = {
    WAITING: 1,
    BUY_COMPLETE: 2,
    BUY_FAIL: 3
};

const INTERVAL=1000; // 1s = 1000 ms
let STOCK=100;

let _stockList = new Map();

function timeOutFunction(name) {

    // Transaction Time-out, if item still waiting mark 
    // it purchase fail and update the stock

    if(_stockList[name] != status.BUY_COMPLETE) {
        _stockList[name] = status.BUY_FAIL;

        // Need to use $inc of MongoDb
        STOCK++;    

        console.log(`Stock UPDATED => ${STOCK}`);
    } else
        console.log(`Stock remains =====> ${STOCK}`);
}

// ------------- routes ---------------
app.get("/buy_clicked", (req, res, next) => {

    var name = req.query.name;
    var time = req.query.time;

    // NEED to use ==>  findAndModify() in MongoDb
    // https://stackoverflow.com/questions/24280144/mongodb-field-increment-with-max-condition-in-update-statement
    // $inc stock by -1
    if( STOCK > 0 ) {
        // Transaction Initiated and in waiting stage
        _stockList[name] = status.WAITING;
        setTimeout(timeOutFunction, time*INTERVAL, name);

        console.log(`Item Bought by => ${name}`);
        console.log(`Stock => ${STOCK}`);

        // $inc stock by -1
        res.json( { stock : STOCK--});
    } else {
        res.json( { stock : 'Sorry -- Out of Stock' });
    }
});

// ------------- routes ---------------
app.get("/buy_complete", (req, res, next) => {
    var name = req.query.name;

    // Set Item purchased
    _stockList[name] = status.BUY_COMPLETE;
    console.log(`Purchase Completed => ${name}`);

    res.json( { status : 'BUY_COMPLETE',  name : name });
});



