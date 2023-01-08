const express = require("express");
const cors =  require('cors');
const { log } = console;


const app = express();

app.use(cors());

app.get("/extract/materials", async function (req, res) {
    const materials = require("../mock/erp.json").materials;
  
    res.status(200).send(materials);
})

app.get("/extract/costs", async function (req, res) {
    const costs = require("../mock/erp.json").maraCosts;
  
    res.status(200).send(costs)
})

app.get("/extract/transactions", async function (req, res) {
    const transactions = require("../mock/erp.json").transaction;
  
    res.status(200).send(transactions)
})

app.get("/extract/bill-of-materials", async function (req, res) {
    const bom = require("../mock/erp.json").bom;
  
    res.status(200).send(bom);
})

app.listen(4040, () => log('erp server running at http://localhost:4040'));
