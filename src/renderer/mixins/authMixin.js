const {google} = require('googleapis')
const Store = require('electron-store')
const store = new Store()
export default {
  methods: {
    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    authorize (credentials, callback) {
      const oAuth2Client = new google.auth.OAuth2(
        credentials.installed.client_id, credentials.installed.client_secret, credentials.installed.redirect_uris[0])
      // Check if we have previously stored a token.
      if (store.has('token.json')) {
        oAuth2Client.setCredentials(store.get('token.json'))
        callback(oAuth2Client)
      } else {
        this.getNewToken(oAuth2Client, callback)
      }
    },
    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    getNewToken (oAuth2Client, callback) {
      if (store.has('code')) {
        let code = store.get('code')
        oAuth2Client.getToken(code, (err, token) => {
          if (err) return console.error('Error while trying to retrieve access token', err)
          store.set('token.json', token)
          oAuth2Client.setCredentials(token)
          callback(oAuth2Client)
        })
      } else {
        this.connectionError = 'secret code not set'
      }
    }
  }
}
