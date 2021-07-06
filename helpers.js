const fs = require('fs');
const { db } = require('./db')
const autoScroll = async () => {
    const internalSleep = async (duration) => new Promise(((resolve) => {
        setTimeout(resolve, duration);
    }));
    for (let i = 0; i < Math.round((Math.random() * 10) + 10); i += 1) {
        window.scrollBy(0, document.body.scrollHeight);
        // eslint-disable-next-line no-await-in-loop
        await internalSleep(
            Math.round(
                (Math.random() * 4000) + 1000,
            ),
        );
    }
    await Promise.resolve();
}

const scanMembers = async (page) => {
    const hrefs = await Promise.all((await page.$x('//a[@href]')).map(async item => await (await item.getProperty('href')).jsonValue()))
    console.log(hrefs);
    saveData(hrefs)

}

const saveData = (data) => {


    let user = {
        uid: 'Mike',
        name: 23,
        link: 'Male'
    };

    let dataIn = JSON.stringify(data);


    fs.writeFileSync('./members.json', dataIn);
}

module.exports = { autoScroll, scanMembers, }


    // await page.waitForXPath(`//*[contains(@id,"member_")]/div`)
    // const allMembers = await page.$x(`//*[contains(@id,"member_")]/div`);
    // for (var i = 0; i < allMembers.length; i++) {
    //     const a = await page.evaluate(el => el.offsetParent.getAttribute('id'), allMembers[i])
    //     const id = await page.evaluate(el => el.textContent, allMembers[i])
    //     console.log(id, a);
    // }