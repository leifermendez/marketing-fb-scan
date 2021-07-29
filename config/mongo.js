const mongoose = require('mongoose')

const dbConnect = () => {
    const DB_URI = process.env.DB_URI
    mongoose.connect(DB_URI,
        {
            useFindAndModify: false,
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, res) => {
            if (!err) {
                console.log('___CONEXION CORRECTA___')
            } else {
                console.log('___ERROR DE CONEXION___')
            }
        }
    )
}

module.exports = { dbConnect }