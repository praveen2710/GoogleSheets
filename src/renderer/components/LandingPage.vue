<template>
  <div id="wrapper">
    <!-- <img id="logo" src="~@/assets/logo.png" alt="electron-vue"> -->
    <!-- <main>
      <div class="left-side">
        <span class="title">
          Welcome to your new project!
        </span>
        <system-information></system-information>
      </div>

      <div class="right-side">
        <div class="doc">
          <div class="title">Getting Started</div>
          <p>
            electron-vue comes packed with detailed documentation that covers everything from
            internal configurations, using the project structure, building your application,
            and so much more.
          </p>
          <button @click="open('https://simulatedgreg.gitbooks.io/electron-vue/content/')">Read the Docs</button><br><br>
        </div>
        <div class="doc">
          <div class="title alt">Other Documentation</div>
          <button class="alt" @click="open('https://electron.atom.io/docs/')">Electron</button>
          <button class="alt" @click="open('https://vuejs.org/v2/guide/')">Vue.js</button>
          <router-link to="/inputform">Navigate to form</router-link>
        </div>
      </div>
    </main> -->
    <form-page :auth="auth" @newRow='addNewRow'></form-page>
    <major-list :rows="rows"></major-list>
  </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'
  import FormPage from './FormPage/FormPage'
  import MajorList from './FormPage/MajorList'

  const fs = require('fs')
  const {google} = require('googleapis')
  var mkdirp = require('mkdirp')
  var getDirName = require('path').dirname

  export default {
    name: 'landing-page',
    components: {SystemInformation, FormPage, MajorList},
    data () {
      return {
        form: {
          name: ''
        },
        show: true,
        // If modifying these scopes, delete token.json.
        SCOPES: ['https://www.googleapis.com/auth/spreadsheets'],
        // The file token.json stores the user's access and refresh tokens, and is
        // created automatically when the authorization flow completes for the first
        // time.
        TOKEN_PATH: 'token.json',
        rows: [],
        auth: {}
      }
    },
    created () {
      fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err)
        // Authorize a client with credentials, then call the Google Sheets API.
        this.authorize(JSON.parse(content), this.listMajors)
      })
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
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
        fs.readFile(this.TOKEN_PATH, (err, token) => {
          if (err) return this.getNewToken(oAuth2Client, callback)
          oAuth2Client.setCredentials(JSON.parse(token))
          callback(oAuth2Client)
        })
      },
      /**
       * Get and store new token after prompting for user authorization, and then
       * execute the given callback with the authorized OAuth2 client.
       * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
       * @param {getEventsCallback} callback The callback for the authorized client.
       */
      getNewToken (oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: this.SCOPES
        })
        console.log('Authorize this app by visiting this url:', authUrl)
        let code = '4/EAEgmB5weTkJBHU31av4ahMkFc4ktzW4u2UuuqaDnDNmFg5c9jEBoac'
        oAuth2Client.getToken(code, (err, token) => {
          if (err) return console.error('Error while trying to retrieve access token', err)
          oAuth2Client.setCredentials(token)
          // Store the token to disk for later program executions
          fs.writeFile(this.TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) return console.error(err)
            console.log('Token stored to', this.TOKEN_PATH)
          })
          callback(oAuth2Client)
        })
      },
      /**
       * Prints the names and majors of students in a sample spreadsheet:
       * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
       * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
       */
      listMajors (auth) {
        this.auth = auth
        const sheets = google.sheets({version: 'v4', auth})
        sheets.spreadsheets.values.get({
          spreadsheetId: '14pkSLWxLYMdPO5eYyW0cEV657g1sExqh-5t-k3wfivg',
          range: 'Sheet1!A2:F'
        }, (err, res) => {
          if (err) return console.log('The API returned an error: ' + err)
          for (let i in res.data.values) {
            let rowData = res.data.values[i]
            this.rows.push({
              id: rowData[0],
              company: rowData[1],
              amount: rowData[2],
              date: rowData[3]
            })
          }
        })
      },
      addNewRow (form) {
        const auth = this.auth
        const sheets = google.sheets({version: 'v4', auth})
        sheets.spreadsheets.values.append({
          spreadsheetId: '14pkSLWxLYMdPO5eYyW0cEV657g1sExqh-5t-k3wfivg',
          range: 'Sheet1!A2:F',
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: [
              [form.id, form.name, form.amount, form.date]
            ]
          },
          auth: auth
        }, (err, res) => {
          if (err) {
            this.writeDataToFile(form)
            return console.log('The API returned an error: ' + err)
          }
          this.listMajors(auth)
        })
      },
      writeDataToFile (data) {
        let fileName = 'data' + new Date()

        const path = 'Pending Upload'
        mkdirp(getDirName(path), function (err) {
          if (err) return console.error(err)

          fs.writeFile(fileName, JSON.stringify(data), (err) => {
            if (err) return console.error(err)
            console.log('data stored in', fileName)
          })
        })
      }
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100vh;
    padding: 60px 80px;
    width: 100vw;
  }

  #logo {
    height: auto;
    margin-bottom: 20px;
    width: 420px;
  }

  main {
    display: flex;
    justify-content: space-between;
  }

  main > div { flex-basis: 50%; }

  .left-side {
    display: flex;
    flex-direction: column;
  }

  .welcome {
    color: #555;
    font-size: 23px;
    margin-bottom: 10px;
  }

  .title {
    color: #2c3e50;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 6px;
  }

  .title.alt {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .doc p {
    color: black;
    margin-bottom: 10px;
  }

  .doc button {
    font-size: .8em;
    cursor: pointer;
    outline: none;
    padding: 0.75em 2em;
    border-radius: 2em;
    display: inline-block;
    color: #fff;
    background-color: #4fc08d;
    transition: all 0.15s ease;
    box-sizing: border-box;
    border: 1px solid #4fc08d;
  }

  .doc button.alt {
    color: #42b983;
    background-color: transparent;
  }
</style>
