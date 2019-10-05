const ctrDistributor = require('../controllers/ctrDistributor');
const ctrRoomType = require('../controllers/ctrRoomType');
const ctrTheater = require('../controllers/ctrTheater');
const ctrMovieFormat = require('../controllers/ctrMovieFormat');
const ctrRoom = require('../controllers/ctrRoom');
const ctrMovie = require('../controllers/ctrMovie');
const ctrUserOption = require('../controllers/ctrUserOption');
const ctrUserRol = require('../controllers/ctrUserRol');
const ctrUser = require('../controllers/ctrUser');

module.exports = {
    addDistributor: ctrDistributor.add,
    updateDistributor: ctrDistributor.update,
    deleteDistributor: ctrDistributor.delete,
    addRoomType: ctrRoomType.add,
    updateRoomType: ctrRoomType.update,
    deleteRoomType: ctrRoomType.delete,
    addTheater: ctrTheater.add,
    updateTheater: ctrTheater.update,
    deleteTheater: ctrTheater.delete,
    addMovieFormat: ctrMovieFormat.add,
    updateMovieFormat: ctrMovieFormat.update,
    deleteMovieFormat: ctrMovieFormat.delete,
    addRoom: ctrRoom.add,
    updateRoom: ctrRoom.update,
    deleteRoom: ctrRoom.delete,
    addMovie: ctrMovie.add,
    updateMovie: ctrMovie.update,
    deleteMovie: ctrMovie.delete,
    addUserOption: ctrUserOption.add,
    updateUserOption: ctrUserOption.update,
    deleteUserOption: ctrUserOption.delete,
    addUserRol: ctrUserRol.add,
    updateUserRol: ctrUserRol.update,
    deleteUserRol: ctrUserRol.delete,
    addUser: ctrUser.add,
    updateUser: ctrUser.update,
    deleteUser: ctrUser.delete
}