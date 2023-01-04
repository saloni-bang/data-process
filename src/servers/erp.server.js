const express = require("express");
const { getDbConnection } = require('../lib/db')

const app = express();

app.get("/extract/materials", function (req, res) {
    const materials = require("../mock/erp.json").materials;
    res.status(200).send(materials);
})

app.get("/extract/costs", function (req, res) {
    const costs = require("../mock/erp.json").maraCosts;
    res.status(200).send(costs)
})

app.get("/extract/transactions", function (req, res) {
    const transactions = require("../mock/erp.json").transaction;
    res.status(200).send(transactions)
})

app.get("/extract/bill-of-materials", function (req, res) {
    const bom = require("../mock/erp.json").bom;
    res.status(200).send(bom)
})

app.get("/transform/transactions", function (req, res) {
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

    const [tableErr, tableRes] = await dbConn.query(`
        CREATE TABLE ERP_TRANSACTIONS (
            date DATE,
            matnr BIGINT,
            units int,
            transaction_id varchar(50),
            transaction_status varchar(15),
            cost int,
            currency varchar(5),
            PRIMARY KEY (transaction_id)
        );
    `);

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

    const [tableErr, tableRes] = dbConn.query(`
        CREATE TABLE ERP_MATERIALS (
            matnr BIGINT,
            matnr_desc varchar(255),
            PRIMARY KEY (matnr)
        );
    `)

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

app.get("/load/material-costs", function (req, res) {

    const materialCosts = require("../mock/erp.json").maraCosts;

    const mysql = require('mysql');
    const connection = mysql.createConnection({
        host: '127.0.0.1',
        user: 'user',
        password: 'password',
        database: 'ERP_DUMPS'
    });

    connection.connect();
    connection.query(`
    CREATE TABLE ERP_MATERIAL_COSTS (
        matnr BIGINT NOT NULL,
        unit_price int,
        currency varchar(6),
        PRIMARY KEY (matnr)
        );
        `, function (error) {
        if (error && error.code !== 'ER_TABLE_EXISTS_ERROR') throw error
        console.log("material_costs table created");
        const values = materialCosts.map(function (item) {
            return Object.values(item)
        })
        connection.query(`
        INSERT INTO ERP_MATERIAL_COSTS (matnr, unit_price, currency  ) VALUES ?`,
            [values], function (err) {
                if (err) { res.status(500).send(err); return; }
                connection.end();
                console.log('SUCCESS')
                res.send("success")
            }
        )
    })
})


app.get("/load/bill-of-materials", function (req, res) {

    const billOfMaterials = require("../mock/erp.json").bom;

    const mysql = require('mysql');
    const connection = mysql.createConnection({
        host: '127.0.0.1',
        user: 'user',
        password: 'password',
        database: 'ERP_DUMPS'
    });

    connection.connect();
    connection.query(`
    CREATE TABLE ERP_BILL_OF_MATERILALS (
        matnr BIGINT NOT NULL,
        bom_id varchar(10),
        product_id varchar(20),
        product_units init
        );
        `, function (error) {
        if (error && error.code !== 'ER_TABLE_EXISTS_ERROR') throw error
        console.log("bill of materials created");
        const values = billOfMaterials.map(function (item) {
            return Object.values(item)
        })
        connection.query(`
        INSERT INTO ERP_MATERIAL_COSTS (matnr, unit_price, currency  ) VALUES ?`,
            [values], function (err) {
                if (err) { res.status(500).send(err); return; }
                connection.end();
                console.log('SUCCESS')
                res.send("success")
            }
        )
    })
})

app.listen(4040);
