const puppeteer = require('puppeteer-extra')
const express = require('express')
const { Cluster } = require('puppeteer-cluster');
const cors = require('cors')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const fs = require('fs')
puppeteer.use(StealthPlugin())
const app = express()
const { autoScroll, scanMembers } = require('./helpers')
const { layout, url, useCookies, puppeterConfig, cookiesFilePath, username, password } = require('./config/config')
app.use(cors())
app.use(express.json())
var page, browser;

const messagesGlobal = [
    `❗ 𝙇𝙀𝙀𝙍 ❗ `,
    `👋 ¿Te interesa aprender Angular y Node GRATIS? te invito a los cursos \n\n`,
]

const messagesLink = [`https://www.facebook.com/108020131360293/posts/140728194756153/`]
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


const init = async () => new Promise(async (resolve, reject) => {
    browser = await puppeteer.launch(puppeterConfig);

    const incognitoContext = await browser.createIncognitoBrowserContext();
    page = await incognitoContext.newPage();
    if (useCookies && fs.existsSync(cookiesFilePath)) {
        const cookiesString = fs.readFileSync(cookiesFilePath);
        const cookies = JSON.parse(cookiesString.toString());
        await page.setCookie(...cookies);
        resolve(true)
    } else {
        const cookies = await page.cookies();
        fs.writeFileSync(cookiesFilePath, JSON.stringify(cookies, null, 2));
        resolve(true)
    }

})


const login = async () => {
    /**
       * Cookie banner
       */

    try {
        if (fs.existsSync(cookiesFilePath)) {
            return true
        }
    } catch (e) {

    }



    try {
        await page.goto(url);
        await page.waitForXPath('//a[@data-cookiebanner="accept_button"]');
        const acceptCookiesButton = (await page.$x('//a[@data-cookiebanner="accept_button"]'))[0];
        await page.evaluate((el) => {
            el.focus();
            el.click();
        }, acceptCookiesButton);
    } catch (e) {
        console.log('Error esperando banner cookie');
    }


    /**
     * Esperando por el boton de login
     */

    await page.waitForSelector(layout.login_form.parent);
    // Focusing to the email input
    await page.focus(layout.login_form.email);
    // Clicking on the email form input to be able to type on input
    await page.focus(layout.login_form.email);
    // Typing on the email input the email address
    await page.keyboard.type(username);
    // Focusing on the password input
    await page.focus(layout.login_form.password);
    // Typing the facebook password on password input
    await page.keyboard.type(password);
    // Clicking on the submit button
    await page.waitForXPath(`//button[@name="login"]`) // ✅
    const [loginButton] = await page.$x(`//button[@name="login"]`);
    await page.evaluate((el) => {
        el.click();
    }, loginButton);

    await page.waitForXPath(`//button[@value="Aceptar"]`) // ✅
    const [touchLoginButton] = await page.$x(`//button[@value="Aceptar"]`);
    await page.evaluate((el) => {
        el.click();
    }, touchLoginButton);

    const cookies = await page.cookies();
    fs.writeFileSync(`./${cookiesFilePath}`, JSON.stringify(cookies, null, 2));



}

const getMembersGroup = async (groupUrl) => {

    await page.goto(groupUrl);
    do {
        await scanMembers(page)
        // await page.evaluate(autoScroll);
    } while (true)

    await scanMembers(page)

    // await page.evaluate((el) => {

    //     console.log(el);
    // }, allMembers);



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
        for (var i = 0; i < 5; i++) {
            await page.evaluate(autoScroll);
            // await page.waitForTimeout(1500)
            await page.waitForXPath(`//a[contains(.,"View more")]`) // ✅ //div[@data-sigil="comment"]
            console.log('HERER');
            const moreComments = await page.$x(`//a[contains(.,"View more")]`) //feed_story_ring1274958392
            await page.evaluate((el) => {
                console.log(el);
                el.focus();
                el.click();
                // el.type('All Answers');
            }, moreComments[0]);

            await page.waitForXPath(`//div[@data-sigil="comment"]`) // ✅ //div[@data-sigil="comment"]
            const listComments = await page.$x(`//div[@data-sigil="comment"]`) //feed_story_ring1274958392

            for (let c of listComments) {

                const text = await page.evaluate(e => e.firstElementChild.getAttribute('data-sigil'), c);
                const id = text.replace('feed_story_ring', '')
                const reply = await page.evaluate(e => e.lastElementChild.lastElementChild.textContent, c);
                const checkReply = reply.includes('reply')

                if (!checkReply) {
                    try {
                        console.log(id, checkReply, counter);
                        await page.$x(`//a[contains(.,"Reply")]`)[counter].click()
                    } catch (e) {
                        return
                    }


                }

                counter++;

            }
        }

    } catch (e) {
        console.log(e);
        return e
    }
}

const initAll = async () => {
    await init()
    await login()
    // await scanComments('https://m.facebook.com/groups/dev.angular/permalink/1155588951596890/')
    // await postToGroup('https://m.facebook.com/groups/codificandolo')
    // await postToGroup('https://m.facebook.com/groups/Angular2LatAm')
    // await postToGroup('https://m.facebook.com/groups/Programadores.Colombia')

    const list = [
        {
            fb_group: 'https://m.facebook.com/groups/Angular2LatAm',
            message: {
                messagesGlobal: '❗𝙇𝙀𝙀𝙍  👋 ¿Estas iniciando en Angular y Node? ❗Cursos gratis❗ \n\n 𝙘𝙡𝙞𝙘𝙠 en la imagen comenta "info"',
                messagesLink: 'https://m.facebook.com/leifermendez.dev/posts/158796466282659'
            },
            check: true
        },
        {
            fb_group: 'https://m.facebook.com/groups/codificandolo',
            message: {
                messagesGlobal: '❗𝙇𝙀𝙀𝙍  👋 ¿Estas iniciando en Angular y Node? ❗Cursos gratis❗ \n\n 𝙘𝙡𝙞𝙘𝙠 en la imagen comenta "info"',
                messagesLink: 'https://www.facebook.com/108020131360293/posts/166251918870447/'
            },
            check: true
        },
        {
            fb_group: 'https://m.facebook.com/groups/comunidad.programacion/',
            message: {
                messagesGlobal: '❗𝙇𝙀𝙀𝙍  👋 ¿Estas iniciando en Angular y Node? ❗Cursos gratis❗ \n\n 𝙘𝙡𝙞𝙘𝙠 en la imagen comenta "info"',
                messagesLink: 'https://www.facebook.com/108020131360293/posts/166251918870447/'
            },
            check: true
        },
        {
            fb_group: 'https://m.facebook.com/groups/programadores.colombia.devmafia',
            message: {
                messagesGlobal: '❗𝙇𝙀𝙀𝙍  👋 ¿Estas iniciando en Angular y Node? ❗Cursos gratis❗ \n\n 𝙘𝙡𝙞𝙘𝙠 en la imagen comenta "info"',
                messagesLink: 'https://www.facebook.com/108020131360293/posts/166251918870447/'
            },
            check: true
        },
        {
            fb_group: 'https://m.facebook.com/groups/nodejslatinoamerica',
            message: {
                messagesGlobal: '❗𝙇𝙀𝙀𝙍  👋 ¿Estas iniciando en Angular y Node? ❗Cursos gratis❗ \n\n 𝙘𝙡𝙞𝙘𝙠 en la imagen comenta "info"',
                messagesLink: 'https://www.facebook.com/108020131360293/posts/166251918870447/'
            },
            check: true
        },
        {
            fb_group: 'https://www.facebook.com/groups/365818130458364',
            message: {
                messagesGlobal: '❗𝙇𝙀𝙀𝙍  👋 ¿Estas iniciando en Angular y Node? ❗Cursos gratis❗ \n\n 𝙘𝙡𝙞𝙘𝙠 en la imagen comenta "info"',
                messagesLink: 'https://www.facebook.com/108020131360293/posts/166251918870447/'
            },
            check: false
        }
    ];

    let queue = []

    const fix = list.filter(a => !(a.check))

    fix.forEach((element) => {
        queue.push(postToGroup(element.fb_group, element.message))
    });

}

// initAll();

const sendGroup = async (req, res) => {
    try {
        const { body } = req;
        await init()
        await login()

        /**
         * message -> messagesLink , messagesGlobal
         */
        await postToGroup(body.fb_group, body.message)
        res.send({ status: 'success' })
    } catch (e) {
        console.log(e);
        res.status(500)
        res.send({ e: 500 })
    }
}

/**
 * //TODO: Iniciamos cola de proceso de puppeter
 */

(async () => {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 2,
        puppeteerOptions: puppeterConfig
    });


    const list = [
        {
            fb_group: 'https://m.facebook.com/groups/Angular2LatAm',
            message: {
                messagesGlobal: '❗𝙇𝙀𝙀𝙍  👋 ¿Estas iniciando en Angular y Node? ❗Cursos gratis❗ \n\n 𝙘𝙡𝙞𝙘𝙠 en la imagen comenta "info"',
                messagesLink: 'https://m.facebook.com/leifermendez.dev/posts/158796466282659'
            },
            check: true
        },
        {
            fb_group: 'https://m.facebook.com/groups/codificandolo',
            message: {
                messagesGlobal: '❗𝙇𝙀𝙀𝙍  👋 ¿Estas iniciando en Angular y Node? ❗Cursos gratis❗ \n\n 𝙘𝙡𝙞𝙘𝙠 en la imagen comenta "info"',
                messagesLink: 'https://www.facebook.com/108020131360293/posts/166251918870447/'
            },
            check: true
        },
        {
            fb_group: 'https://m.facebook.com/groups/comunidad.programacion/',
            message: {
                messagesGlobal: '❗𝙇𝙀𝙀𝙍  👋 ¿Estas iniciando en Angular y Node? ❗Cursos gratis❗ \n\n 𝙘𝙡𝙞𝙘𝙠 en la imagen comenta "info"',
                messagesLink: 'https://www.facebook.com/108020131360293/posts/166251918870447/'
            },
            check: true
        },
        {
            fb_group: 'https://m.facebook.com/groups/programadores.colombia.devmafia',
            message: {
                messagesGlobal: '❗𝙇𝙀𝙀𝙍  👋 ¿Estas iniciando en Angular y Node? ❗Cursos gratis❗ \n\n 𝙘𝙡𝙞𝙘𝙠 en la imagen comenta "info"',
                messagesLink: 'https://www.facebook.com/108020131360293/posts/166251918870447/'
            },
            check: true
        },
        {
            fb_group: 'https://m.facebook.com/groups/nodejslatinoamerica',
            message: {
                messagesGlobal: '❗𝙇𝙀𝙀𝙍  👋 ¿Estas iniciando en Angular y Node? ❗Cursos gratis❗ \n\n 𝙘𝙡𝙞𝙘𝙠 en la imagen comenta "info"',
                messagesLink: 'https://www.facebook.com/108020131360293/posts/166251918870447/'
            },
            check: true
        },
        {
            fb_group: 'https://m.facebook.com/groups/365818130458364',
            message: {
                messagesGlobal: '❗𝙇𝙀𝙀𝙍  👋 ¿Estas iniciando en Angular y Node? ❗Cursos gratis❗ \n\n 𝙘𝙡𝙞𝙘𝙠 en la imagen comenta "info"',
                messagesLink: 'https://www.facebook.com/108020131360293/posts/166251918870447/'
            },
            check: true
        },
        {
            fb_group: 'https://m.facebook.com/groups/allprogramando',
            message: {
                messagesGlobal: '❗𝙇𝙀𝙀𝙍  👋 ¿Estas iniciando en Angular y Node? ❗Cursos gratis❗ \n\n 𝙘𝙡𝙞𝙘𝙠 en la imagen comenta "info"',
                messagesLink: 'https://www.facebook.com/108020131360293/posts/166251918870447/'
            },
            check: false
        },
        {
            fb_group: 'https://M.facebook.com/groups/1236631223375591',
            message: {
                messagesGlobal: '❗𝙇𝙀𝙀𝙍❗  👋 ¿Estas iniciando en Angular y Node? ❗Cursos gratis❗ \n\n 𝙘𝙡𝙞𝙘𝙠 en la imagen comenta "info"',
                messagesLink: 'https://www.facebook.com/108020131360293/posts/166251918870447/'
            },
            check: false
        }
    ];


    const loginSession = async ({ page, data: url }) => {
        await page.goto(url);
        if (useCookies && fs.existsSync(cookiesFilePath)) {
            const cookiesString = fs.readFileSync(cookiesFilePath);
            const cookies = JSON.parse(cookiesString.toString());
            await page.setCookie(...cookies);
            resolve(true)
        } else {
            const cookies = await page.cookies();
            fs.writeFileSync(cookiesFilePath, JSON.stringify(cookies, null, 2));
            resolve(true)
        }
    };

    const singlePost = async ({ page, data }) => {
        {
            try {
                if (useCookies && fs.existsSync(cookiesFilePath)) {
                    const cookiesString = fs.readFileSync(cookiesFilePath);
                    const cookies = JSON.parse(cookiesString.toString());
                    await page.setCookie(...cookies);

                }
                console.log('--->', data);
                const { fb_group, message } = data;

                await page.goto(fb_group, { waitUntil: "networkidle0" });


                //TODO: Capturamos el placeholder de postear

                const layoutWrite = '//div[contains(.,"Write something...")]';

                await page.waitForXPath(layoutWrite)

                const textInputMessage = (await page.$x(layoutWrite)).reverse()[0];
                await page.evaluate((el) => {
                    el.focus();
                    el.click();
                    console.log(el);
                }, textInputMessage);

                //TODO: Capturamos el input de postear

                const layoutInputWrite = `//textarea[@aria-label="What's on your mind?"]`;
                await page.waitForXPath(layoutInputWrite)
                await page.waitForTimeout(1000)
                const childTxt = (await page.$x(layoutInputWrite))[0];
                await page.evaluate((el) => {
                    el.focus();
                    el.click();
                }, childTxt);


                //TODO: Escribimos el mensaje!

                const layoutText = `//div[@id="mshare_preview_placeholder"]`;
                await page.keyboard.type(message.messagesGlobal + message.messagesLink);
                await page.waitForTimeout(1000)
                await page.waitForXPath(layoutText)
                await page.evaluate((el) => {
                    el.focus();
                    el.click();
                }, childTxt);

                for (let i = 0; i < message.messagesLink.length; i++) {
                    await page.keyboard.press('Backspace');
                }

                //TODO: Click boton de enviar

                const layoutBtnPost = `//button[@type="submit" and @value="Post"]`

                await page.waitForXPath(layoutBtnPost)
                const btnPost = (await page.$x(layoutBtnPost))[0];
                await page.evaluate((el) => {
                    el.click();
                    console.log(el);
                }, btnPost);
                await page.waitForTimeout(1000)
                await page.on('dialog', async dialog => {
                    console.log(dialog.message());
                    await dialog.accept();
                });
                await page.close();
            } catch (e) {
                console.log('Ocurrio un error!', e);
            }
        }
    }


    cluster.queue('https://m.facebook.com', loginSession);

    const dd = {
        fb_group: 'https://m.facebook.com/groups/nodejslatinoamerica',
        message: {
            messagesGlobal: '❗𝙇𝙀𝙀𝙍  👋 ¿Estas iniciando en Angular y Node? ❗Cursos gratis❗ \n\n 𝙘𝙡𝙞𝙘𝙠 en la imagen comenta "info"',
            messagesLink: 'https://www.facebook.com/108020131360293/posts/166251918870447/'
        },
        check: false
    }

    list.forEach(element => {
        if (!element.check) {
            cluster.queue(element, singlePost);
        }
    })







    await cluster.idle();
    await cluster.close();
})();

// app.post('/', sendGroup)

// app.listen(3000, () => {
//     console.log('Ready 3000');
// })