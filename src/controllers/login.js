const pathCookieAccount = `${__dirname}/../../tmp`
const { url, layout } = require('../../config/config')
const { consoleMessage } = require('../helpers/console')
const autoScroll = require('../helpers/autoScroll')
const { getAccount } = require('./accounts')
const { getGroup, saveLog, checkLog } = require('./groups')
const { createLeadBulk } = require('./leads')
const fs = require('fs')

var userFb;

const init = async ({ page }) => {
    try {
        userFb = await getAccount()
        const cookiFileAccount = `${pathCookieAccount}/${userFb._id}.json`
        consoleMessage('Starting puppeter', 'blueBright')

        if (fs.existsSync(cookiFileAccount)) {
            const cookiesString = fs.readFileSync(cookiFileAccount);
            const cookies = JSON.parse(cookiesString.toString());
            await page.setCookie(...cookies);
            consoleMessage('Cookie  found ✔', 'green')
            Promise.resolve(true)
        } else {
            const cookies = await page.cookies();
            fs.writeFileSync(cookiFileAccount, JSON.stringify(cookies, null, 2));
            consoleMessage(`Cookie ${userFb.email} file created ✔`, 'yellow')
            Promise.resolve(true)
        }
    } catch (e) {
        Promise.reject(e)
    }
};

// Check ✔
const login = async ({ page }) => {
    /**
       * Cookie banner
       */
    const cookiFileAccount = `${pathCookieAccount}/${userFb._id}.json`
    try {

        consoleMessage(`Chek Login ${userFb.email}`, 'yellow')

        const cookiesString = fs.readFileSync(cookiFileAccount, 'utf-8');
        const cookiesParse = JSON.parse(cookiesString.toString())
        if (fs.existsSync(cookiFileAccount) && cookiesParse.length) {
            consoleMessage('Cookie valid', 'yellow')
            return true
        }

    } catch (e) {
        new Error('ERROR_UNDEFINED')
    }


    try {
        consoleMessage('Starting new login', 'yellow')
        await page.goto(url);
        await page.waitForXPath('//a[@data-cookiebanner="accept_button"]');
        const acceptCookiesButton = (await page.$x('//a[@data-cookiebanner="accept_button"]'))[0];
        await page.evaluate((el) => {
            el.focus();
            el.click();
        }, acceptCookiesButton);

    } catch (e) {
        new Error('ERROR_WAIT_BANNER_COOKIE')
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
    await page.keyboard.type(userFb.email);
    // Focusing on the password input
    await page.focus(layout.login_form.password);
    // Typing the facebook password on password input
    await page.keyboard.type(userFb.password);
    // Clicking on the submit button
    await page.waitForXPath(`//button[@name="login"]`)
    const [loginButton] = await page.$x(`//button[@name="login"]`);
    await page.evaluate((el) => {
        el.click();
    }, loginButton);
    const languageAccount = userFb.language || 'en'
    const layoutLanguage = languageAccount === 'en' ? '//button[@value="OK"]' : '//button[@value="Aceptar"]'
    await page.waitForXPath(layoutLanguage) // ✅
    const [touchLoginButton] = await page.$x(layoutLanguage); // Si el FB esta en español "Aceptar"
    await page.evaluate((el) => {
        el.click();
    }, touchLoginButton);

    const cookies = await page.cookies();
    fs.writeFileSync(cookiFileAccount, JSON.stringify(cookies, null, 2));
    consoleMessage('New cookie valid', 'yellow')


}

//
const addListener = (type, page) => {
    return page.evaluateOnNewDocument(type => {
        // here we are in the browser context
        document.addEventListener(type, e => {
            window.onCustomEvent({ type, detail: e.detail });
        });
    }, type);
}

// get members

const getMembersIn = async (page) => {
    try {
        linkUser = []
        const tmpArrayUser = await page.$$eval('[role="link"]', elms => elms.map(elm => {
            const parseArray = elm.getAttribute('href').split('/');
            const checkUser = parseArray.includes('user')
            const name = (elm.innerHTML && elm.innerHTML.length < 81) ? elm.innerHTML : null;
            parseArray.pop()
            const uuid = (checkUser) ? parseArray.pop() : null;
            const userObject = {
                name,
                uuid
            }
            return userObject
        }));

        linkUser = linkUser.concat(tmpArrayUser).filter(a => (a.uuid !== null && a.name !== null))
        linkUser = [...new Set(linkUser)]
        await createLeadBulk(linkUser)
        consoleMessage(`Saving...(${linkUser.length})`, 'blueBright')
    } catch (e) {
        console.log('Cerrando...')
    }
}

const scanGroup = async ({ page, data }) => {

    try {
        page.evaluate(() => {
            window.onbeforeunload = null;
        });

        page.on('dialog', async dialog => {
            console.log(dialog.message());
            await dialog.accept();
        });

        await page.exposeFunction('onCustomEvent', (e) => {
            getMembersIn(page)
        });

        const { idGroup } = data;
        await page.waitForTimeout(1500)
        addListener('scroll', page)
        await page.goto(`https://www.facebook.com/groups/${idGroup}/members`, { waitUntil: "networkidle0" });



        await autoScroll(page, 400, 1050)
        // 

    } catch (e) {
        console.log('Error', e)
    }
}

/*
*/

const scanMembers = async ({ page, data }) => {
    await init({ page })
    await login({ page })
    await scanGroup({ page, data })
}


module.exports = { scanMembers }