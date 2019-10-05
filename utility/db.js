require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = process.env.DB_HOST;

const { ObjectID } = require('mongodb');
const { errorHandler } = require('../utility/errorHandler');
const config = require('../config');

class Db {

    set database(value) {
        this.databaseValue = value;
    }
    get database() {
        return this.databaseValue;
    }

    set client(value) {
        this.clientValue = value;
    }

    get client() {
        return this.clientValue;
    }

    constructor() {
        this.database = process.env.DB_NAME;
    }

    static async findOne(args) {
        let objCnn = null;
        try {
            objCnn = await Db.openConnection();
            if (!objCnn.status) {
                return objCnn;
            }
            let db = objCnn.client.db(args.dbName);
            let collection = db.collection(args.collectionName);
            let result = await collection.findOne(args.params);
            if (!result) {
                return {
                    status: false,
                    message: `Result findOne method is null or undefined.`
                };
            }
            return {
                status: true,
                result
            };
        } catch (error) {
            return {
                status: false,
                message: error
            };
        } finally {
            if (objCnn && objCnn.client)
                objCnn.client.close();
        }
    }

    static async find(args) {
        let objCnn = null;
        try {
            objCnn = await Db.openConnection();
            if (!objCnn.status) {
                return objCnn;
            }
            let db = objCnn.client.db(args.dbName);
            let collection = db.collection(args.collectionName);
            let result = await collection.find(args.params).toArray();
            if (!result) {
                return {
                    status: false,
                    message: `Result find method is null or undefined.`
                };
            }
            return {
                status: true,
                result
            };
        } catch (error) {
            return {
                status: false,
                message: error
            };
        } finally {
            if (objCnn && objCnn.client)
                objCnn.client.close();
        }
    }

    static async findAggrupate(args) {
        let objCnn = null;
        objCnn = await Db.openConnection();
        if (!objCnn.status) {
            return objCnn;
        }
        let db = objCnn.client.db(args.dbName);
        let collection = db.collection(args.collectionName);
        let result = await collection.aggregate(args.pipeline).toArray();
        if (!result) {
            return {
                status: false,
                message: 'Can not get result from agggregate'
            };
        }
        return {
            status: true,
            result
        };
    }

    static async insertOne(args) {
        let objCnn = null;
        try {
            objCnn = await Db.openConnection();
            if (!objCnn.status) {
                return objCnn;
            }
            let db = objCnn.client.db(args.dbName);
            let collection = db.collection(args.collectionName);
            let result = await collection.insertOne(args.params);
            if (!result) {
                return {
                    status: false,
                    message: `Result insertOne method is null or undefined.`
                };
            }
            return {
                status: true,
                _id: ObjectID(result.insertedId)
            };
        } catch (error) {
            return {
                status: false,
                message: error
            };
        } finally {
            if (objCnn && objCnn.client)
                objCnn.client.close();
        }
    }

    static async update(args) {
        let objCnn = null;
        try {
            objCnn = await Db.openConnection();
            if (!objCnn.status) {
                return objCnn;
            }
            let db = objCnn.client.db(args.dbName);
            let collection = db.collection(args.collectionName);
            let result = await collection.updateOne({ _id: ObjectID(args._id) }, { $set: args.set });
            if (!result) {
                return {
                    status: false,
                    message: `Result update method is null or undefined.`
                };
            }
            return {
                status: true,
                result
            };
        } catch (error) {
            return {
                status: false,
                message: error
            };
        } finally {
            if (objCnn && objCnn.client)
                objCnn.client.close();
        }
    }

    static async delete(args) {
        let objCnn = null;
        try {
            objCnn = await Db.openConnection();
            if (!objCnn.status) {
                return objCnn;
            }
            let db = objCnn.client.db(args.dbName);
            let collection = db.collection(args.collectionName);
            let result = await collection.deleteOne({ _id: ObjectID(args._id) });
            if (!result) {
                return {
                    status: false,
                    message: `Result delete method is null or undefined.`
                };
            }
            return {
                status: true,
                result
            };
        } catch (error) {
            return {
                status: false,
                message: error
            };
        } finally {
            if (objCnn && objCnn.client)
                objCnn.client.close();
        }
    }

    static openConnection() {
        return new Promise(resolve => {
            MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
                assert.equal(null, error);
                if (error) {
                    resolve({
                        status: false,
                        message: error
                    });
                    return;
                }
                //let db = client.db(this.database);
                resolve({
                    status: true,
                    client
                });
            });
        });
    }

    closeConnection() {
        this.client.close();
    }

}

module.exports = Db;