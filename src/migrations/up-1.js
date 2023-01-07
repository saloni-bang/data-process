const { getDbConnection } = require('../lib/db');
const { log } = console;

const runUp1 = async () => {

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
        CREATE TABLE ERP_TRANSACTIONS (
            date DATE,
            matnr BIGINT,
            units int,
            transaction_id varchar(50),
            transaction_status varchar(15),
            cost int,
            currency varchar(5),
            PRIMARY KEY (transaction_id),
            FOREIGN KEY (matnr) REFERENCES ERP_MATERIALS(matnr)
        );
    `);

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
        CREATE TABLE ERP_BILL_OF_MATERILALS (
            matnr BIGINT NOT NULL,
            bom_id varchar(10),
            product_id varchar(50),
            product_units int,
            PRIMARY KEY (bom_id),
            FOREIGN KEY (matnr) REFERENCES ERP_MATERIALS(matnr)
        );
    `);

    if (err) throw err;

}



getDbConnection().then(dbConn => {
    dbConn.transact(runUp1)
        .then(([err, data]) => {
            if(err) log('migration runUp1 failed during execution');
            else log('migration runUp1 ran successfully'); 
        })
        .catch((err) => {
            log('migration runUp1 failed during execution',err)
        })
});
