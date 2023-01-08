const express = require("express");
const cors = require('cors');

const { log } = console;

const app = express();

app.use(cors());

app.get("/extract/products", async function (req, res) {
    const products = require("../mock/srm.json").products;
  
    res.status(200).send(products);
});

app.get("/extract/vendors", async function (req, res) {
    const vendors = require("../mock/srm.json").vendors;
  
    res.status(200).send(vendors)
});

app.get("/extract/transactions", async function (req, res) {
    const transactions = require("../mock/srm.json").transaction;
  
    res.status(200).send(transactions)
});

app.listen(3038, () => log('srm server running at http://localhost:3038'));
