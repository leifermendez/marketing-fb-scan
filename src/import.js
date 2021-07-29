require('dotenv').config()
const { dbConnect } = require('../config/mongo')
const dataRaw = require('../data/raw-groups.json')
const groupModel = require('./models/group')


const startImport = async () => {

    const process = (data) => Promise.resolve(data)


    const dataParse = await Promise.all(
        dataRaw.map(a => {
            const b = {
                ...a, ...{
                    fbGroupMobile: `https://m.facebook.com/groups/${a.id}`,
                    public: false
                }
            }
            return process(b)
        })
    )

    await groupModel.bulkWrite(
        dataParse.map((product) =>
        ({
            updateOne: {
                filter: { idGroup: product.id },
                update: { $set: product },
                upsert: true
            }
        })
        )
    )

    console.log('**** Ready Import ****')

}

startImport()

dbConnect()