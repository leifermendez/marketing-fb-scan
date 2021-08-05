const axios = require('axios');
const { errorCatch } = require('../helpers/errorHandle')

const url = `https://secret-mountain-13331.herokuapp.com/api/1.0`

const sendNoty = async ({ title = '', type = 'error', message = '', source = '' }) => {
    try {
        const { data } = await axios.post(
            `${url}/notification`,
            { title, type, message, source }
        )
        return data;
    } catch (e) {
        errorCatch(e)
    }
}

module.exports = { sendNoty }