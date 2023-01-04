const mysql = require('mysql');

const dbConn = {
    connected: false,
    error: new Error('Db is not yet connected'),
    query: async (queryString, options = {}) => {
        const [error, data] = [dbConn.error, null];
        return [error, data]
    }
}

const getDbConnection = async () => {

    if (dbConn.connected) return dbConn;

    const mysqlCon = mysql.createConnection({
        host: '127.0.0.1',
        user: 'user',
        password: 'password',
        database: 'dataprocess-db'
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

        const queryPromise = new Promise((resolve, reject) => {
            mysqlCon.query(queryString, options, (err, data) => {
                if (err) resolve([err, null]);
                resolve([null, data]);
            })
        })

        return queryPromise;

    }

    return dbConn;
}

module.exports = { getDbConnection }