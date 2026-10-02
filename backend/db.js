const mysql = require("mysql2");

require("dotenv").config();


const db = mysql.createPool({

    host: process.env.DB_HOST,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME,

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0

});


db.getConnection(function(error, connection) {

    if (error) {

        console.error(
            "Database connection failed:",
            error.message
        );

        return;
    }


    console.log(
        "Connected to Kitchen Story database."
    );


    connection.release();

});


module.exports = db;