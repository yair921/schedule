const fs = require('fs');
exports.errorHandler = (args) => {
    let error = `\r\n${new Date().toISOString()}: ${args.method} -> ${args.message};`;
    console.error(error);
    fs.appendFile('error.txt', error, (err) => {
            if (err) {
            console.log(`errorHandler error -> ${err}`);
        }
    });
};