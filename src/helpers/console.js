const chalk = require('chalk');

const consoleMessage = (text, color) => {
    console.log(chalk[color](`:::::::::::--------  ${text}  --------::::::::::`));
}

module.exports = { consoleMessage }