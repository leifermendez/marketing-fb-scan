require('dotenv').config()
const puppeteer = require('puppeteer-extra')
const express = require('express')
const { Cluster } = require('puppeteer-cluster');
const cors = require('cors')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { dbConnect } = require('../config/mongo')
puppeteer.use(StealthPlugin())
const app = express()
const { puppeterConfig } = require('../config/config')
const { postGroup } = require('./helpers/login')

app.use(cors())
app.use(express.json())

var page;



/**
 * //TODO: Iniciamos cola de proceso de puppeter
 */


const initAll = async () => {

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 1,
        puppeteerOptions: puppeterConfig
    });

    const element = [
        {
            messagesGlobal: `𝙘𝙖𝙘𝙝𝙚 🙄 Comenta si haz implantando este método en tu aplicación`,
            messagesLink: 'https://jvi0t2jpq9.execute-api.us-east-2.amazonaws.com/default/getLastVideo?playlist=PL_WGMLcL4jzUqFyIL_LCQQJl6U93_c1NU'
        },
        {
            messagesGlobal: `𝙘𝙖𝙘𝙝𝙚 😎 Sabías que puedes aplicar estrategias de caché y mejorar la velocidad de tu APP`,
            messagesLink: 'https://jvi0t2jpq9.execute-api.us-east-2.amazonaws.com/default/getLastVideo?playlist=PL_WGMLcL4jzUqFyIL_LCQQJl6U93_c1NU'
        }
    ]



    element.forEach(message => {
        cluster.queue(message, postGroup);
    })

    await cluster.idle();
    await cluster.close();
}

const cronStart = async () => {

    const MINUTE = process.env.MINUTES || 10;
    consoleMessage(`📆 Cron every ${MINUTE} minutes...`, 'greenBright')
    cron.schedule(`*/${MINUTE} * * * *`, () => {
        initAll()
    });
}
initAll()
// cronStart()
dbConnect()


