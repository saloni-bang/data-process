const express = require("express");

const app = express();

app.get("/extract/products", function(req,res){
    const products = require("../mock/srm.json").products;
    res.status(200).send(products);

})

app.get("/extract/vendors",function(res,req){
 const vendors = require("../mock/srm.json").vendors;
 res.status(200).send(vendors)
})

app.get("/extract/transactions",function(res,req){
    const transactions = require("../mock/srm.json").vendors;
    res.status(200).send(transactions)
   })
app.listen(3030);
