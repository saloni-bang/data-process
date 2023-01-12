const express = require("express");
const cors = require('cors');
const { getDbConnection } = require('../lib/db');
const path = require('path');
const { query } = require("express");

const { log } = console;

const app = express();

app.use(cors());

app.use(express.static(path.resolve(__dirname, '../pages/home')));

app.get('/', (req, res) => {
    const fullPath = path.resolve(__dirname, '../pages/home/home.html');
    res.sendFile(fullPath);
})

app.get('/transform-erp-transactions', async (req, res) => {
    const transactions = require("../mock/erp.json").transaction;
    const costs = require("../mock/erp.json").maraCosts;
    const transformedTransactions = [];
    for (const transaction of transactions) {
        const trans = { ...transaction };
        if (trans.currency === 'INR') {
            trans.currency = 'USD';
            trans.cost = trans.cost / 80;
        }
        transformedTransactions.push(trans);
    }

    res.status(200).send(transformedTransactions);

});

app.get('/transform-srm-transactions', async (req, res) => {
    const transactions = require('../mock/srm.json').transaction;

    const transformedTransaction = transactions.map(transaction => {
        const trans = {...transaction};
        if(trans.currency === 'INR') {
            trans.currency = 'USD';
            trans.unit_price = trans.unit_price / 80;
            trans.total_price = trans.unit_price * trans.total_units
        }
        return trans;
    });

    res.status(200).send(transformedTransaction);

});

app.get('/initialize-erp-tables', async (req, res) => {

    const { initErpTables } = require('../migrations/init-erp-tables');

    const dbConn = await getDbConnection();

    const [err, result] = await dbConn.transact(initErpTables);

    if (err) return res.status(500).send(err);

    return res.status(200).send({ message: 'Initialized ERP tables' });

});

app.get('/initialize-srm-tables', async (req, res) => {
    const { initSrmTables } = require('../migrations/init-srm-tables');

    const dbConn = await getDbConnection();

    const [err, result] = await dbConn.transact(initSrmTables);

    if (err) return res.status(500).send(err);


    return res.status(200).send({ message: 'Initialized SRM tables' });

});

app.get('/load-erp-materials', async (req, res) => {
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

});

app.get('/load-erp-material-costs', async (req, res) => {
    const materialCosts = require("../mock/erp.json").maraCosts;

    const values = materialCosts.map(i => {
        return Object.values(i)
    });

    const dbConn = await getDbConnection();

    const [err, data] = await dbConn.query(`
        INSERT INTO ERP_MATERIAL_COSTS (matnr, unit_price, currency  ) VALUES ?`,
        [values]
    )

    if (err) return res.status(500).send(err);

    return res.status(200).send(data);

});

app.get('/load-erp-bill-of-materials', async (req, res) => {
    const billOfMaterials = require("../mock/erp.json").bom;

    const values = billOfMaterials.map(i => {
        return Object.values(i)
    });

    const dbConn = await getDbConnection();

    const [err, data] = await dbConn.query(`
        INSERT INTO ERP_BILL_OF_MATERIALS VALUES ?`,
        [values]
    );

    if (err) return res.status(500).send(err)

    return res.status(200).send(data);
});

app.get('/load-erp-transactions', async (req, res) => {
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
        `INSERT INTO ERP_TRANSACTIONS VALUES ?`,
        [values]
    );

    if (insertErr) {
        return res.status(500).send(insertErr);
    }

    return res.status(200).send(insertRes);
});

app.get('/load-srm-products', async (req, res) => {
    const products = require("../mock/srm.json").products;

    const values = products.map(i => {
        return Object.values(i)
    });

    const dbConn = await getDbConnection();

    const [err, data] = await dbConn.query(`
        INSERT INTO SRM_PRODUCTS VALUES ?`,
        [values]
    )

    if (err) return res.status(500).send(err)

    return res.status(200).send(data);

});

app.get('/load-srm-vendors', async (req, res) => {
    const vendors = require("../mock/srm.json").vendors;

    const values = vendors.map(i => {
        return Object.values(i)
    });

    const dbConn = await getDbConnection();

    const [err, data] = await dbConn.query(`
        INSERT INTO SRM_VENDORS VALUES ?`,
        [values]
    )

    if (err) return res.status(500).send(err)

    return res.status(200).send(data);

});

app.get('/load-srm-transactions', async (req, res) => {
    const transactions = require("../mock/srm.json").transaction;


    const transformedTransaction = transactions.map(transaction => {
        return {
            ...transaction,
            total_price: transaction.unit_price * transaction.total_units
        }
    });

    const values = transformedTransaction.map(i => {
        return Object.values(i)
    });

    const dbConn = await getDbConnection();

    const [err, data] = await dbConn.query(`
        INSERT INTO SRM_TRANSACTIONS VALUES ?`,
        [values]
    )

    if (err) return res.status(500).send(err)

    return res.status(200).send(data);

});

app.get('/clear-all', async (req, res) => {
    const dbConn = await getDbConnection();

    const queryStr = [
        'ERP_BILL_OF_MATERIALS',
        'ERP_MATERIAL_COSTS',
        'ERP_TRANSACTIONS',
        'ERP_MATERIALS',
        'SRM_TRANSACTIONS',
        'SRM_PRODUCTS',
        'SRM_VENDORS'
    ].map(i => `DROP TABLE IF EXISTS ${i};`).join('');

    const [err, data] = await dbConn.query(queryStr)

    if (err) return res.status(500).send(err);

    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);

    return res.status(200).send({ message: 'All tables were dropped' });

});

app.get('/material-proc-vs-sell', async (req, res) => {
    const queryStr = `        
    WITH material_proc AS (
            select  
                    a.matnr,
                    a.product_id, 
                    a.product_units,
                    (a.product_units * round(avg(b.unit_price),0)) as 'proc_price'
            from erp_bill_of_materials  a , srm_transactions b
            where a.product_id = b.product_id 
            group by matnr, product_id, product_units
            order by matnr
    ),
    material_proc_unit AS (
            select matnr, sum(proc_price) as 'proc_unit_price'
            from material_proc
            group by matnr
            order by matnr
    )
    select a.matnr, sum(proc_unit_price * units) as 'proc_price', sum(cost) as 'sell_price'
    from material_proc_unit a , erp_transactions b 
    where a.matnr = b.matnr
    group by matnr
    order by matnr;`;

    const dbConn = await getDbConnection();

    const [err, data] = await dbConn.query(queryStr)

    if (err) return res.status(500).send(err)

    return res.status(200).send(data);

})


app.listen(3090, () => log('etl server running at http://localhost:3090'));