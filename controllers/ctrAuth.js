const jwt = require('jsonwebtoken');
const Db = require('../utility/db');
const bcrypt = require('bcryptjs');
const config = require('../config');
const className = 'CtrAuth';
const collectionName = 'user';

class CtrAuth {
    static async login(global, input) {
        let args = {
            dbName: config.db.programacion,
            collectionName,
            params: { userName: input.input.userName, active: true }
        };
        const objUser = await Db.findOne(args);
        if (!objUser.status) {
            return {
                status: false,
                message: `The login failed.`,
                token: null
            };
        }
        let validatePsw = await bcrypt.compare(input.input.password, objUser.result.password);
        if (!validatePsw) {
            return {
                status: false,
                message: `The login failed.`,
                token: null
            };
        }

        // Aggregation function
        let argsAggregation = {
            dbName: config.db.programacion,
            collectionName,
            pipeline: [
                {
                    $match: {
                        idUserRol: objUser.result.idUserRol
                    }
                },
                {
                    $lookup:
                    {
                        from: 'user_rol',
                        as: 'objUserRol',
                        localField: 'idUserRol',
                        foreignField: '_id'
                    }
                },
                {
                    $match: {
                        idTheater: objUser.result.idTheater
                    }
                },
                {
                    $lookup:
                    {
                        from: 'theater',
                        as: 'objTheater',
                        localField: 'idTheater',
                        foreignField: '_id'
                    }
                }
            ]
        };

        let objAggrupate = await Db.findAggrupate(argsAggregation);
        if (!objAggrupate.status) {
            return {
                status: false,
                message: `The login failed.`,
                token: null
            };
        }
        let { objUserRol, objTheater } = objAggrupate.result[0];

        return {
            status: true,
            message: null,
            token: CtrAuth.generateToken({
                _id: objUser.result._id,
                objUserRol,
                objTheater,
                idUserRol: objUser.result.idUserRol,
                idTheater: objUser.result.idTheater,
                fullName: objUser.result.fullName,
                email: objUser.result.email,
                userName: objUser.result.userName,
            })
        };
    }

    static validateLogin({ token, option, action }) {
        // Validate if token is not empty.
        if (!token) {
            return {
                status: false,
                message: 'Missing token.'
            };
        }
        try {
            let decode = jwt.verify(token, config.secretKey);
            if (!decode) {
                return {
                    status: false,
                    message: 'Worg token.'
                };
            }
            // Validation permissions.
            let objOption = decode.objUserRol[0].permissions.filter(f => f.nameUserOption === option);
            if (objOption.length === 0) {
                return {
                    status: false,
                    message: config.messages.unauthorized
                };
            }

            // Validation actions permissions.
            if (objOption[0].actions.filter(f => f.toLowerCase() === action).length === 0) {
                return {
                    status: false,
                    message: config.messages.unauthorized
                };
            }
            return {
                status: true
            }
        } catch (error) {
            return {
                status: false,
                message: error.message
            }
        }
    }

    static generateToken(obj) {
        let token = jwt.sign(obj, config.secretKey, {
            expiresIn: 60 * 60
        });
        return token;
    }

}

module.exports = CtrAuth;