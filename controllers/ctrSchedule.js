const { ObjectID } = require('mongodb');
const { errorHandler } = require('../utility/errorHandler');
const ctrAuth = require('./ctrAuth');
const Db = require('../utility/db');
const config = require('../config');
const Helper = require('../utility/helper');
const ctrRoom = require('./ctrRoom');
const ctrMovie = require('./ctrMovie');
const className = 'CtrSchedule';
const collectionName = 'schedule';

class CtrSchedule {

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
            let processDataArr = new Array();
            let processData;
            for (let i in objResult.result) {
                processData = await CtrSchedule.processSchedule(objResult.result[i]);
                if (processData.status)
                    processDataArr.push(processData.result);
            }
            return {
                status: true,
                message: null,
                data: processDataArr
            };
        } catch (error) {
            errorHandler({
                method: `${className}.getAll`,
                message: `Unexpected error -> ${error}`
            });
            return resError;
        }
    }

    static async getOne(global, args) {

        // Build object error.
        let resError = {
            ...config.messages.getFail,
            data: null
        };

        // Validation permissions.
        let auth = ctrAuth.validateLogin({ token: args.token, option: collectionName, action: config.actions.get });
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
                params: {
                    enabled: true,
                    idTheater: ObjectID(args.idTheater),
                    idPeriod: ObjectID(args.idPeriod)
                }
            });
            if (!objResult.status) {
                errorHandler({
                    method: `${className}.getOne`,
                    message: `${config.messages.errorConnectionDb} -> ${objResult.message}`
                });
                return resError
            }
            let processData = await CtrSchedule.processSchedule(objResult.result[0], args.idTheater);
            //console.log(processData);
            if (!processData.status) {
                return {
                    status: true,
                    message: processData.message,
                    data: null
                };
            }
            return {
                status: true,
                message: null,
                data: processData.result
            };
        } catch (error) {
            errorHandler({
                method: `${className}.getOne`,
                message: `Unexpected error -> ${error}`
            });
            return resError;
        }
    }

    static async processSchedule(data, idTheater) {
        try {
            let token = null;
            let objMovies = await ctrMovie.getAll(null, { token }, true);
            //let objRooms = await ctrRoom.getAll(null, { token }, true);
            let objRooms = await ctrRoom.getByTheater(null, { token, idTheater }, true);
            if (!objMovies.status || !objRooms.status) {
                return {
                    status: false,
                    message: 'Error getting movies or rooms for schedule'
                };
            }

            let rooms = objRooms.data;
            let movies = objMovies.data;
            let roomsResult = new Array();

            // data.rooms.forEach(room => {
            //     for (let r in rooms) {
            //         if (rooms[r]._id.toString() === room.idRoom.toString()) {
            //             roomsResult.push({
            //                 ...room,
            //                 roomNumber: rooms[r].roomNumber,
            //                 roomName: rooms[r].roomName,
            //                 movies: CtrSchedule.getMoviesDetails(movies, room)
            //             });
            //             break;
            //         }
            //     }
            // });

            let find = false;
            rooms.forEach(room => {
                if (data) {
                    for (let r in data.rooms) {
                        if (data.rooms[r].idRoom.toString() === room._id.toString()) {
                            find = true;
                            roomsResult.push({
                                ...room,
                                idRoom: room._id,
                                movies: CtrSchedule.getMoviesDetails(movies, data.rooms[r])
                            });
                            break;
                        }
                    }
                    if (!find) {
                        roomsResult.push({
                            ...room,
                            idRoom: room._id,
                            movies: []
                        });
                    }
                    find = false;
                } else {
                    roomsResult.push({
                        ...room,
                        idRoom: room._id,
                        movies: []
                    });
                }
            });




            let result = {
                ...data,
                rooms: roomsResult
            }
            return {
                status: true,
                result
            }
        } catch (error) {
            errorHandler({
                method: `${className}.processSchedule`,
                message: `Unexpected error -> ${error}`
            });
            return {
                status: false,
                message: error
            }
        }
    }

    static getMoviesDetails(movies, room) {
        let moviesResult = new Array();
        room.movies.forEach(movie => {
            for (let m in movies) {
                if (movies[m]._id.toString() === movie.idMovie.toString()) {
                    moviesResult.push({
                        ...movie,
                        ...movies[m]
                    });
                    break;
                }
            }
        });
        return moviesResult;
    }

    static async add(global, args) {

        // Build object error.
        let resError = {
            ...config.messages.addFail,
            _id: null
        }

        // Validation permissions.
        let auth = ctrAuth.validateLogin({
            token: args.token,
            option: collectionName,
            action: config.actions.add
        });
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
                idPeriod: ObjectID(args.input.idPeriod),
                idTheater: ObjectID(args.input.idTheater)
            }
        });
        if (exist) {
            return {
                status: false,
                message: `The schedule alredy exist!`,
                _id: null
            };
        }
        try {
            let newObj = {
                ...args.input,
                idPeriod: ObjectID(args.input.idPeriod),
                idTheater: ObjectID(args.input.idTheater),
                rooms: Helper.processScheduleRooms(args.input.rooms),
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
            if (args.input.idPeriod)
                args.input.idPeriod = ObjectID(args.input.idPeriod);
            if (args.input.idTheater)
                args.input.idTheater = ObjectID(args.input.idTheater);
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

module.exports = CtrSchedule;