require('dotenv').config()
const puppeteer = require('puppeteer-extra')
const express = require('express')
const { Cluster } = require('puppeteer-cluster');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { dbConnect } = require('../config/mongo')
puppeteer.use(StealthPlugin())
const cron = require('node-cron')
const { consoleMessage } = require('./helpers/console')
const { puppeterConfig } = require('../config/config')
const { postGroup } = require('./controllers/login')
const listMessages = require('./controllers/excel')
const moment = require('moment')




/**
 * //TODO: Iniciamos cola de proceso de puppeter
 */


const initAll = async (messages = []) => {

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 1,
        puppeteerOptions: puppeterConfig,
        retryLimit: 0,
        timeout: 60000
    });


    const cycleNumber = [...Array.from(Array(parseInt(process.env.POST_NUMBER)).keys())]

    messages.forEach(message => {

        //TODO: Revisamos la cantidad de mensajes para hoy
        //TODO: Publicamos X numero de  grupos

        cycleNumber.forEach(() => {
            cluster.queue(message, postGroup);
        })

    })

    await cluster.idle();
    await cluster.close();


}

const initMessage = () => {
    listMessages((messages) => {
        messages = messages.filter(a => (a))
        messages = messages.map(([messagesGlobal, messagesLink, tag, date]) => {
            const today = moment()
            const checkDate = today.diff(moment(date, 'DD/MM/YYYY'), 'hours')
            console.log(checkDate)
            if (checkDate < 24 && checkDate > 0) {
                return {
                    messagesGlobal,
                    messagesLink,
                    tag
                }
            }

        })
        messages = messages.filter(a => (a))
        initAll(messages)
    })
}

const cronStart = async () => {

    consoleMessage(`📆 Cron every day 10:00 AM ...`, 'greenBright')

    cron.schedule(`0 10 * * *`, () => {
        initMessage()
    });

    consoleMessage(`📆 Cron every day 06:00 PM ...`, 'greenBright')

    cron.schedule(`0 18 * * *`, () => {
        initMessage()
    });

    consoleMessage(`📆 Cron every day 08:00 PM ...`, 'greenBright')

    cron.schedule(`0 20 * * *`, () => {
        initMessage()
    });

    consoleMessage(`📆 Cron every day 10:00 PM ...`, 'greenBright')

    cron.schedule(`0 22 * * *`, () => {
        initMessage()
    });
}


cronStart()
dbConnect()


