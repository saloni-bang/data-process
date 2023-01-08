const { getDbConnection } = require('../lib/db');

const initSrmTables = async () => {

    const dbConn = await getDbConnection();

    // create matnr table

    let err, res;

    [err, res] = await dbConn.query(`
        CREATE TABLE SRM_PRODUCTS (
            product_id bigint,
            product_name varchar(255),
            product_desc varchar(255),
            product_weight_kg int,
            product_height_cm int,
            product_width_cm int,
            PRIMARY KEY (product_id)
        );
    `)

    if (err) throw err;


    [err, res] = await dbConn.query(`
        CREATE TABLE SRM_VENDORS (
            vendor_id bigint NOT NULL,
            vendor_name varchar(255),
            vendor_address varchar(255),
            PRIMARY KEY (vendor_id)
        );
    `);

    if (err) throw err;


    [err, res] = await dbConn.query(`
        CREATE TABLE SRM_TRANSACTIONS (
            transaction_id bigint,
            date DATE,
            transaction_status varchar(15),
            vendor_id bigint,
            product_id bigint,
            unit_price int,
            currency varchar(5),
            total_units int,
            total_price int,
            PRIMARY KEY (transaction_id),
            FOREIGN KEY (vendor_id) REFERENCES SRM_VENDORS(vendor_id),
            FOREIGN KEY (product_id) REFERENCES SRM_PRODUCTS(product_id)
        );
    `);

    if (err) throw err;

}

module.exports = {
    initSrmTables
}