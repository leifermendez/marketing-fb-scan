require('dotenv').config()
const puppeteer = require('puppeteer-extra')
const express = require('express')
const { Cluster } = require('puppeteer-cluster');
const cors = require('cors')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { dbConnect } = require('../config/mongo')
puppeteer.use(StealthPlugin())
const app = express()
const { autoScroll } = require('../helpers')
const { puppeterConfig } = require('../config/config')
const { postGroup } = require('./helpers/login')

app.use(cors())
app.use(express.json())

var page;

/**
 * Funciones
 * */

const disableAssets = async () => {
    if (page === undefined) {
        throw new InitialisationError();
    }
    await page.setRequestInterception(true);
    const blockResources = [
        'image', 'media', 'font', 'textrack', 'object',
        'beacon', 'csp_report', 'imageset',
    ];
    page.on('request', (request) => {
        const rt = request.resourceType();
        if (
            blockResources.indexOf(rt) > 0
            || request.url()
                .match(/\.((jpe?g)|png|gif)/) != null
        ) {
            request.abort();
        } else {
            request.continue();
        }
    });
}


const replyComment = async () => {
    try {

    } catch (e) {
        console.log(e);
        return e
    }
}

const scanComments = async (postUrl) => {
    try {
        await page.goto(postUrl, { waitUntil: "networkidle0" });
        await page.waitForXPath(`//select[@name="comment_switcher"]`) // ✅
        const [switchComment] = await page.$x(`//select[@name="comment_switcher"]`);
        await page.evaluate((el) => {
            console.log(el);
            el.focus();
            el.click();
            // el.type('All Answers');
        }, switchComment);

        await page.select('select[name="comment_switcher"]', 'recent_activity');
        await page.waitForTimeout(1500)
        let counter = 0;
        let counterComment = 0;
        for (var i = 0; i < 5; i++) {
            await page.evaluate(autoScroll);
            // Si tiene mas comentario scroll
            // await page.waitForXPath(`//a[contains(.,"View more")]`)  <--------------
            // console.log('HERER');
            // const moreComments = await page.$x(`//a[contains(.,"View more")]`) 
            // await page.evaluate((el) => {
            //     console.log(el);
            //     el.focus();
            //     el.click();
            // }, moreComments[0]);

            await page.waitForXPath(`//div[@data-sigil="comment"]`) // ✅ //div[@data-sigil="comment"]
            const listComments = await page.$x(`//div[@data-sigil="comment"]`) //feed_story_ring1274958392
            // console.log(listComments);

            for (let c of listComments) {

                const text = await page.evaluate(e => e.firstElementChild.getAttribute('data-sigil'), c);
                console.log(text, counter);
                await page.waitForXPath(`//a[contains(.,"Reply")]`)
                const elementReply = await page.$x(`//a[contains(.,"Reply")]`)
                await page.evaluate((el) => {
                    el.focus();
                    el.click();
                }, elementReply[counterComment]);
                console.log(elementReply);

                await page.waitForXPath(`//div[contains(.,"Write a reply")]`)
                const elementInputReply = await page.$x(`//div[contains(.,"Write a reply")]`)

                await page.evaluate(async (el) => {
                    el.focus();
                    el.click();
                    // await page.keyboard.type('Hola!');
                }, elementInputReply[counterComment]);

                counterComment++
                // elementReply.click()  Write a reply...
                // const id = text.replace('feed_story_ring', '') Claro te comparto el acceso https://m.me/leifermendez.dev?ref=w15429383
                // const reply = await page.evaluate(e => e.lastElementChild.lastElementChild.textContent, c);

                // const checkReply = reply.includes('reply')

                // if (!checkReply) {
                //     try {
                //         console.log(id, checkReply, counter);
                //         await page.$x(`//a[contains(.,"Reply")]`)[counter].click()
                //     } catch (e) {
                //         return
                //     }


                // }

                counter++;

            }
        }

    } catch (e) {
        console.log(e);
        return e
    }
}

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


