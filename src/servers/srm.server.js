const express = require("express");
const cors = require('cors');
const { getDbConnection } = require('../lib/db');
const { delayProm } = require('../lib/utils');

const app = express();

app.use(cors());

app.get("/extract/products", async function (req, res) {
    const products = require("../mock/srm.json").products;
    await delayProm(1500);
    res.status(200).send(products);
});

app.get("/extract/vendors", async function (req, res) {
    const vendors = require("../mock/srm.json").vendors;
    await delayProm(1500);
    res.status(200).send(vendors)
});

app.get("/extract/transactions", async function (req, res) {
    const transactions = require("../mock/srm.json").transaction;
    await delayProm(1500);
    res.status(200).send(transactions)
});

app.listen(3038);
