const mysql = require('mysql');

const dbConn = {
    connected: false,
    error: new Error('Db is not yet connected'),
    query: async (queryString, options = {}) => {
        const [error, data] = [dbConn.error, null];
        return [error, data]
    },
    transact: async (asyncFunc = async () => null) => {
        const [err, data] = [new Error('asyncFunc is not provided'), null];
        return [err, null]
    },
    rollback: async () => Promise.resolve(null),
    commit: async () => {
        const [error, data] = [new Error('commit not defined'), null];
        return [error, data];
    }
}

const getDbConnection = async () => {

    if (dbConn.connected) return dbConn;

    const mysqlCon = mysql.createConnection({
        host: '127.0.0.1',
        user: 'user',
        password: 'password',
        database: 'dataprocess-db',
        multipleStatements: true
    });

    const connectionPromise = new Promise((resolve, reject) => {
        mysqlCon.connect((err, data) => {
            if (err) reject(err);
            resolve(data);
        })
    })

    try {
        await connectionPromise;
    } catch (err) {
        dbConn.error = err;
        return dbConn;
    }

    dbConn.connected = true;

    dbConn.error = null;

    dbConn.query = async (queryString, options = {}) => {
        const safeString = queryString.replace(/[\n\r]/g, '');
        const queryPromise = new Promise((resolve, reject) => {
            mysqlCon.query(safeString, options, (err, data) => {
                if (err) resolve([err, null]);
                resolve([null, data]);
            })
        })

        return queryPromise;

    }

    dbConn.rollback = async () => {
        const rollbackProm = new Promise((resolve, reject) => {
            mysqlCon.rollback((err, data) => {
                if (err) reject();
                resolve();
            })
        });

        return await rollbackProm;
    }

    dbConn.commit = async () => {
        const commitProm = new Promise((resolve, reject) => {
            mysqlCon.commit((err, data) => {
                if (err) resolve([err, null]);
                resolve([null, data]);
            })
        });

        return await commitProm;
    }

    dbConn.transact = async (asyncFunc = async () => null) => {

        let transactErr, transactRes;

        const beginTransactionProm = new Promise((resolve, reject) => {
            mysqlCon.beginTransaction((err, data) => {
                if (err) resolve([err, null]);
                resolve([null, data]);
            })
        });

        [transactErr, transactRes] = await beginTransactionProm;

        if (transactErr) {
            return [transactErr, transactRes];
        }

        try {
            transactRes = await asyncFunc();
        } catch (err) {
            await dbConn.rollback();
            return [err, null];
        }

        const [cErr, cRes] = await dbConn.commit();

        if (cErr) {
            await dbConn.rollback()
            return [cErr, null]
        }

        return [transactErr, transactRes];
    }

    return dbConn;
}

module.exports = { getDbConnection }