const { getDbConnection } = require('../lib/db');

const initErpTables = async () => {

    const dbConn = await getDbConnection();
    
    // create matnr table

    let err, res;

    [err, res] =  await dbConn.query(`
        CREATE TABLE ERP_MATERIALS (
            matnr BIGINT,
            matnr_desc varchar(255),
            PRIMARY KEY (matnr)
        );
    `)
    
    if (err) throw err;

    [err, res] = await dbConn.query(`
        CREATE TABLE ERP_MATERIAL_COSTS (
            matnr BIGINT NOT NULL,
            unit_price int,
            currency varchar(6),
            PRIMARY KEY (matnr),
            FOREIGN KEY (matnr) REFERENCES ERP_MATERIALS(matnr)
        );
    `);

    if (err) throw err;

    [err, res] = await dbConn.query(`
        CREATE TABLE ERP_BILL_OF_MATERIALS (
            bom_id bigint,
            matnr bigint,
            product_id bigint,
            product_units int,
            PRIMARY KEY (bom_id),
            FOREIGN KEY (matnr) REFERENCES ERP_MATERIALS(matnr)
        );
    `);

    if (err) throw err;

    [err, res] = await dbConn.query(`
        CREATE TABLE ERP_TRANSACTIONS (
            transaction_id bigint,
            date date,
            transaction_status varchar(15),
            matnr bigint,
            units int,
            cost int,
            currency varchar(5),
            PRIMARY KEY (transaction_id),
            FOREIGN KEY (matnr) REFERENCES ERP_MATERIALS(matnr)
        );
    `);

    if (err) throw err;

}

module.exports = {
    initErpTables
}
