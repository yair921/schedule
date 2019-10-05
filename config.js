module.exports = {
    messages: {
        errorGeneric: { status: false, message: `A error has ocurred!` },
        errorUnexpected: { status: false, message: `A unexpected error has ocurred!` },
        errorConnectionDb: `Error connecting to database`,
        errorMongoFind: `Error to execute find method of mongodb.`,
        addSuccesss: 'Registro agregado exitosamente!',
        updateSuccesss: { status: true, message: `Registro actualizado exitosamente!` },
        deleteSuccesss: { status: true, message: `Registro eliminado exitosamente!` },
        addFail: { status: false, message: `No se ha podido agregar el registro.` },
        updateFail: { status: false, message: `No se ha podido actualizar el registro.` },
        deleteFail: { status: false, message: `No se ha podido eliminar el registro.` },
        getFail: { status: false, message: `No se ha podido realizar la consulta.` },
        unauthorized: 'Unauthorized to this operation.'
    },
    actions: {
        get: 'get',
        add: 'add',
        update: 'update',
        delete: 'delete'
    },
    db: {
        programacion: 'procinal-programacion'
    },
    secretKey: 'th3S3cr3tK3yM0$tP0pul4r'
};