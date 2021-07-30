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
const { postGroup, joinGroup } = require('./controllers/login')

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
        puppeteerOptions: puppeterConfig,
        retryLimit: 0,
        timeout: 300000
    });

    const message = {
        messagesGlobal: `𝙘𝙖𝙘𝙝𝙚 🙄 Comenta si haz implantando este método en tu aplicación`,
        messagesLink: 'https://jvi0t2jpq9.execute-api.us-east-2.amazonaws.com/default/getLastVideo?playlist=PL_WGMLcL4jzUqFyIL_LCQQJl6U93_c1NU'
    }



    const cycleNumber = [...Array.from(Array(parseInt(process.env.POST_NUMBER)).keys())]

    cycleNumber.forEach(() => {
        console.log('--->', message)
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


