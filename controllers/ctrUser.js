const { ObjectID } = require('mongodb');
const { errorHandler } = require('../utility/errorHandler');
const ctrAuth = require('./ctrAuth');
const Db = require('../utility/db');
const config = require('../config');
const Helper = require('../utility/helper');
const className = 'CtrUser';
const collectionName = 'user';

class CtrUser {

    static async getAll(global, { token }) {

        // Build object error.
        let resError = {
            ...config.messages.getFail,
            data: null
        };

        // Validation permissions.
        let auth = ctrAuth.validateLogin({ token, option: collectionName, action: config.actions.get });
        if (!auth.status) {
            return {
                ...resError,
                message: auth.message
            };
        }

        try {
            let objResult = await Db.find({
                dbName: config.db.programacion,
                collectionName,
                params: { enabled: true }
            });
            if (!objResult.status) {
                errorHandler({
                    method: `${className}.getAll`,
                    message: `${config.messages.errorConnectionDb} -> ${objResult.message}`
                });
                return resError
            }
            return {
                status: true,
                message: null,
                data: objResult.result
            };
        } catch (error) {
            errorHandler({
                method: `${className}.add`,
                message: `Unexpected error -> ${error}`
            });
            return resError;
        }
    }

    static async add(global, args) {

        // Build object error.
        let resError = {
            ...config.messages.addFail,
            _id: null
        }

        // Validation permissions.
        let auth = ctrAuth.validateLogin({ token: args.token, option: collectionName, action: config.actions.add });
        if (!auth.status) {
            return {
                ...resError,
                message: auth.message
            };
        }

        let exist = await Helper.validateIfExist({
            dbName: config.db.programacion,
            collectionName,
            params: {
                userName: args.input.userName
            }
        });
        if (exist) {
            return {
                status: false,
                message: `The userName alredy exist!`,
                _id: null
            };
        }
        try {
            let newObj = {
                ...args.input,
                idUserRol: ObjectID(args.input.idUserRol),
                idTheater: ObjectID(args.input.idTheater),
                password: await Helper.encrypt(args.input.password),
                active: true,
                enabled: true,
                create_at: new Date(),
                updated_at: new Date()
            };
            let objResult = await Db.insertOne({
                dbName: config.db.programacion,
                collectionName,
                params: newObj
            });
            if (!objResult.status) {
                errorHandler({
                    method: `${className}.add`,
                    message: `${config.messages.errorConnectionDb} -> ${objResult.message}`
                });
                return resError;
            }
            return {
                status: true,
                message: config.messages.addSuccesss,
                _id: objResult._id
            }
        } catch (error) {
            errorHandler({
                method: `${className}.add`,
                message: `Unexpected error -> ${error}`
            });
            return { ...config.messages.errorUnexpected, _id: null };
        }
    }

    static async update(global, args) {
        try {
            // Validation permissions.
            let auth = ctrAuth.validateLogin({ token: args.token, option: collectionName, action: config.actions.update });
            if (!auth.status) {
                return {
                    status: false,
                    message: auth.message
                };
            }
            if (args.input.idTeatro)
                args.input.idTeatro = ObjectID(args.input.idTeatro);
            if (args.input.idUserRol)
                args.input.idUserRol = ObjectID(args.input.idUserRol);
            if (args.input.password)
                args.input.password = await Helper.encrypt(args.input.password);
            let objResult = await Db.update({
                dbName: config.db.programacion,
                collectionName,
                _id: args._id,
                set: { ...args.input, updated_at: new Date() }
            });
            if (!objResult.status) {
                errorHandler({
                    method: `${className}.update`,
                    message: `${config.messages.errorConnectionDb} -> ${objResult.message}`
                });
                return config.messages.updateFail;
            }
            if (objResult.result && objResult.result.matchedCount > 0) {
                return config.messages.updateSuccesss;
            }
            return config.messages.updateFail;
        } catch (error) {
            errorHandler({
                method: `${className}.update`,
                message: `Unexpected error -> ${error}`
            });
            return config.messages.errorUnexpected;
        }
    }

    static async delete(global, args) {
        try {
            // Validation permissions.
            let auth = ctrAuth.validateLogin({ token: args.token, option: collectionName, action: config.actions.delete });
            if (!auth.status) {
                return {
                    status: false,
                    message: auth.message
                };
            }
            let objResult = await Db.delete({
                dbName: config.db.programacion,
                collectionName,
                _id: args._id
            });
            if (!objResult.status) {
                errorHandler({
                    method: `${className}.delete`,
                    message: `${config.messages.errorConnectionDb} -> ${objResult.message}`
                });
                return config.messages.deleteFail;
            }
            return config.messages.deleteSuccesss;
        } catch (error) {
            errorHandler({
                method: `${className}.delete`,
                message: `Unexpected error -> ${error}`
            });
            return config.messages.errorUnexpected;
        }
    }

}

module.exports = CtrUser;