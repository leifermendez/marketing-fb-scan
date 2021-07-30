module.exports = {
    url: 'https://m.facebook.com',
    puppeterConfig: {
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sendbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
        ],
    },
    username: '',
    password: '',
    useCookies: true,
    cookiesFilePath: './cookies.json',
    layout: {
        login_form: {
            email: 'input#m_login_email',
            password: 'input[type="password"]',
            submit: 'button[data-sigil="touchable login_button_block m_login_button"]',
            parent: 'form',
        },
        facebook_group: {
            m_group_stories_container: '#m_group_stories_container',
            m_group_post_div: '#m_group_stories_container .storyStream article',
            m_group_story_container: '#m_group_stories_container .storyStream article .story_body_container',
        }
    }
}