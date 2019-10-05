require('dotenv').config();
const bcrypt = require('bcryptjs');
const { errorHandler } = require('../utility/errorHandler');
const Db = require('../utility/db');
const config = require('../config');
const className = 'Helper';

class Helper {
    static async validateIfExist(args) {
        try {
            let objResult = await Db.find({
                dbName: config.db.programacion,
                collectionName: args.collectionName,
                params: { ...args.params, enabled: true }
            });
            if (!objResult.status) {
                errorHandler({
                    method: `${className}.validateIfExist`,
                    message: objResult.message
                });
                return true;
            } else if (objResult.result.length > 0) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            errorHandler({
                method: `${className}.validateIfExist`,
                message: `${config.messages.errorUnexpected} -> ${error}`
            });
            return true;
        }
    }
    static async encrypt(text) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(text, salt);
    }
}
module.exports = Helper;