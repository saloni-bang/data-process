const express = require("express");
const cors =  require('cors');
const { getDbConnection } = require('../lib/db');
const { delayProm } = require('../lib/utils');

const app = express();

app.use(cors());

app.get("/extract/materials", async function (req, res) {
    const materials = require("../mock/erp.json").materials;
    await delayProm(2000);
    res.status(200).send(materials);
})

app.get("/extract/costs", async function (req, res) {
    const costs = require("../mock/erp.json").maraCosts;
    await delayProm(2000);
    res.status(200).send(costs)
})

app.get("/extract/transactions", async function (req, res) {
    const transactions = require("../mock/erp.json").transaction;
    await delayProm(2000);
    res.status(200).send(transactions)
})

app.get("/extract/bill-of-materials", async function (req, res) {
    const bom = require("../mock/erp.json").bom;
    await delayProm(2000);
    res.status(200).send(bom);
})

app.get("/transform/transactions", async function (req, res) {
    const transactions = require("../mock/erp.json").transaction;
    const costs = require("../mock/erp.json").maraCosts;
    const transformedTransactions = [];
    for (const transaction of transactions) {
        const materialCost = costs.find(i => i.matnr === transaction.matnr);
        transformedTransactions.push({
            ...transaction,
            cost: transaction.units * materialCost?.unit_price,
            currency: materialCost.currency
        })
    }
    await delayProm(2000);
    res.status(200).send(transformedTransactions);
})

app.get("/load/transactions", async function (req, res) {

    // transaform part

    const transactions = require("../mock/erp.json").transaction;
    const costs = require("../mock/erp.json").maraCosts;
    const transformedTransactions = [];
    for (const transaction of transactions) {
        const materialCost = costs.find(i => i.matnr === transaction.matnr);
        transformedTransactions.push({
            ...transaction,
            cost: transaction.units * materialCost?.unit_price,
            currency: materialCost.currency
        })
    }

    //load part

    const dbConn = await getDbConnection();

    const values = transformedTransactions.map(i => {
        i.date = new Date(i.date);
        return Object.values(i)
    });

    const [insertErr, insertRes] = await dbConn.query(
        `INSERT INTO ERP_TRANSACTIONS (date, transaction_id, transaction_status, matnr, units, cost, currency) VALUES ?`,
        [values]
    );

    if (insertErr) {
        return res.status(500).send(insertErr);
    }

    return res.status(200).send(insertRes);

})


app.get("/load/materials", async function (req, res) {

    const materials = require("../mock/erp.json").materials;

    const dbConn = await getDbConnection();

    const values = materials.map(i => {
        return Object.values(i)
    });

    const [insertErr, insertRes] = await dbConn.query(
        `INSERT INTO ERP_MATERIALS (matnr, matnr_desc ) VALUES ?`,
        [values]
    );

    if (insertErr) {
        return res.status(500).send(insertErr);
    }

    return res.status(200).send(insertRes);
})

app.get("/load/material-costs", async function (req, res) {

    const materialCosts = require("../mock/erp.json").maraCosts;

    const values = materialCosts.map(i => {
        return Object.values(i)
    });

    const dbConn = getDbConnection();

    const [err, data] = await dbConn.query(`
        INSERT INTO ERP_MATERIAL_COSTS (matnr, unit_price, currency  ) VALUES ?`,
        [values]
    )

    if (err) return res.status(500).send(err)

    return res.status(200).send(data);

})


app.get("/load/bill-of-materials", async function (req, res) {

    const billOfMaterials = require("../mock/erp.json").bom;

    const values = billOfMaterials.map(i => {
        return Object.values(i)
    });

    const dbConn = getDbConnection();

    const [err, data] = await dbConn.query(`
        INSERT INTO ERP_MATERIAL_COSTS (matnr, unit_price, currency  ) VALUES ?`,
        [values]
    );

    if (err) return res.status(500).send(err)

    return res.status(200).send(data);
})

app.listen(4040);
