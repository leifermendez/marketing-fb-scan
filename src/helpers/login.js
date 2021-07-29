const pathCookieAccount = `${__dirname}/../../tmp`
const { url, layout } = require('../../config/config')
const { consoleMessage } = require('../helpers/console')
const { getAccount } = require('../helpers/accounts')
const { getGroup, saveLog, checkLog } = require('../helpers/groups')
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

// Check ✔
const closeBrowser = () => browser.close()

const singlePost = async ({ page, data }) => {
    try {
        page.evaluate(() => {
            window.onbeforeunload = null;
        });
        page.on('dialog', async dialog => {
            console.log(dialog.message());
            await dialog.accept();
        });
        const message = data;
        const group = await getGroup(message)
        const { fbGroupMobile } = group;
        const checkRegister = await checkLog({ idGroup: group.idGroup })
        if (checkRegister) return true;

        await page.goto(fbGroupMobile, { waitUntil: "networkidle0" });

        //TODO: Capturamos el placeholder de postear
        const layoutWrite = (userFb.language === 'en')
            ? '//div[contains(.,"Write something...")]' : '//div[contains(.,"Escribe algo...")]';

        await page.waitForXPath(layoutWrite)

        const textInputMessage = (await page.$x(layoutWrite)).reverse()[0];
        await page.evaluate((el) => {
            el.focus();
            el.click();
            console.log(el);
        }, textInputMessage);

        //TODO: Capturamos el input de postear

        const layoutInputWrite = (userFb.language === 'en') ?
            `//textarea[@aria-label="What's on your mind?"]` : `//textarea[@aria-label="¿Qué estás pensando?"]`
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
        await page.waitForTimeout(2000)
        await page.waitForXPath(layoutText)
        await page.evaluate((el) => {
            el.focus();
            el.click();
        }, childTxt);

        for (let i = 0; i < message.messagesLink.length; i++) {
            await page.keyboard.press('Backspace');
        }

        //TODO: Click boton de enviar

        const layoutBtnPost = (userFb.language === 'en') ?
            `//button[@type="submit" and @value="Post"]` : `//button[@type="submit" and @value="Publicar"]`

        await page.waitForXPath(layoutBtnPost)
        const btnPost = (await page.$x(layoutBtnPost))[0];
        await page.evaluate((el) => {
            el.click();
        }, btnPost);

        await saveLog({ idGroup: group.idGroup, message: message.messagesGlobal })
        await page.waitForTimeout(6000)

        await page.close();


    } catch (e) {
        console.log('Ocurrio un error!', e);
    }
}

const initLogin = async ({ page }) => {
    await init({ page })
    await login({ page })
}

const postGroup = async ({ page, data }) => {
    await init({ page })
    await login({ page })
    await singlePost({ page, data })
}

module.exports = { initLogin, postGroup }