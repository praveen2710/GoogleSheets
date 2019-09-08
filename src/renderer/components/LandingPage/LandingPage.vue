<template>
  <div id="wrapper">
    <div v-if="connectionError !== ''">
       <h1 class="error">{{connectionError}}</h1>
    </div>
    <div v-else> 
      <form-page :form="form" :companyList="companyList" :partyNoList="partyNoList" @newRow='addNewRow' @updatedRow='findRowPosition'></form-page>
      <major-list :rows="rows" @editRow='loadRowToEdit'></major-list>
    </div>
  </div>
</template>

<script>
  import FormPage from '../FormPage/FormPage'
  import MajorList from '../FormPage/MajorList'
  import authMixin from '../../mixins/authMixin'
  
  const remote = require('electron').remote
  const app = remote.app

  const fs = require('fs')
  const {google} = require('googleapis')
  var mkdirp = require('mkdirp')
  const path = require('path')
  const fileLoc = path.join(app.getPath('home'), 'offlineData')
  const Store = require('electron-store')
  const store = new Store()

  export default {
    name: 'landing-page',
    components: {FormPage, MajorList},
    mixins: [authMixin],
    data () {
      return {
        form: {
          company: '',
          partyNo: '',
          kachaAmt: 0,
          pakkaAmt: 0,
          id: '',
          createdDate: null,
          updateDate: null
        },
        show: true,
        // If modifying these scopes, delete token.json.
        SCOPES: ['https://www.googleapis.com/auth/spreadsheets'],
        // The file token.json stores the user's access and refresh tokens, and is
        // created automatically when the authorization flow completes for the first
        // time.
        TOKEN_PATH: 'token.json',
        rows: [],
        offLineRowIds: [],
        cachedOnLineRows: [],
        auth: {},
        connectionError: '',
        spreadsheetId: '',
        companyList: [],
        partyNoList: []
      }
    },
    created () {
      if (store.has('docId')) {
        this.spreadsheetId = store.get('docId')
        if (store.has('credentials.json')) {
          this.authorize(JSON.parse(store.get('credentials.json')), this.loadFormData)
          this.retrieveCompaniesList()
          this.retrievePartyNoList()
          this.uploadOfflineRows()
        } else {
          this.connectionError = 'credentials not found'
        }
      } else {
        this.connectionError = 'docId not set'
      }
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      retrieveCompaniesList () {
        let auth = this.auth
        const sheets = google.sheets({version: 'v4', auth})
        sheets.spreadsheets.values.get({
          spreadsheetId: store.get('docId'),
          range: 'Companies!A1:A'
        }, (err, res) => {
          if (err) return console.error('Error while trying to load companies list', err)
          for (let i in res.data.values) {
            this.companyList.push(res.data.values[i][0])
          }
        })
      },
      retrievePartyNoList () {
        let auth = this.auth
        const sheets = google.sheets({version: 'v4', auth})
        sheets.spreadsheets.values.get({
          spreadsheetId: store.get('docId'),
          range: 'PartyNo!A1:A'
        }, (err, res) => {
          if (err) return console.error('Error while trying to load partyNo list', err)
          for (let i in res.data.values) {
            this.partyNoList.push(res.data.values[i][0])
          }
        })
      },
      /**
       * Prints the names and majors of students in a sample spreadsheet:
       * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
       * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
       */
      loadFormData (auth) {
        this.rows = []
        this.auth = auth
        const sheets = google.sheets({version: 'v4', auth})
        this.readOnlineRows(sheets, this.spreadSheetId).then((retrievedRows) => {
          this.cachedOnLineRows = retrievedRows
          this.rows.push(...retrievedRows)
        }).catch((err) => {
          console.log('failed to retrieve online data currently', err)
          this.cachedOnLineRows = this.cachedOnLineRows.filter(row => !this.offLineRowIds.includes(row.id))
          this.rows.push(...this.cachedOnLineRows)
        })
        this.readOfflineRows()
      },
      readOnlineRows (sheets) {
        const sheetId = this.spreadsheetId
        return new Promise((resolve, reject) => {
          sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            // valueRenderOption: 'UNFORMATTED_VALUE',
            // spreadsheetId: '14pkSLWxLYMdPO5eYyW0cEV657g1sExqh-5t-k3wfivg',
            range: 'Sheet1!A2:J'
          }, (err, res) => {
            if (err) return reject(err)
            let retrievedRows = []
            for (let i in res.data.values) {
              let rowData = res.data.values[i]
              var ONE_DAY = 1000 * 60 * 60 * 24
              var diff = new Date() - new Date(rowData[7])
              if ((diff / ONE_DAY) < 8) {
                retrievedRows.push({
                  sno: Number(rowData[0]),
                  entryDate: this.toDate(rowData[1]), // moment(rowData[1]).format('MMM Do YY'),
                  company: rowData[2],
                  partyNo: rowData[3],
                  pakkaAmt: Number(rowData[4]),
                  kachaAmt: Number(rowData[5]),
                  boxes: rowData[6],
                  createdDate: new Date(rowData[7]), // moment(rowData[7]).startOf('day').fromNow()
                  updateDate: new Date(rowData[8]),
                  id: rowData[9]
                })
              }
            }
            resolve(retrievedRows)
          })
        })
      },
      addNewRow (form) {
        this.writeDataOnline(form).then(() => {
          this.loadFormData(this.auth)
          this.uploadOfflineRows()
        }).catch((err) => {
          console.log('failed to upload saving it locally: ', err)
          this.writeDataToFile(form)
        })
      },
      writeDataOnline (formData) {
        return new Promise((resolve, reject) => {
          const auth = this.auth
          const sheets = google.sheets({version: 'v4', auth})
          let newEntry = {
            spreadsheetId: store.get('docId'),
            range: 'Sheet1!A2:J',
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
              values: [
                [formData.sno, formData.entryDate, formData.company, formData.partyNo, formData.pakkaAmt, formData.kachaAmt, formData.boxes, formData.createdDate, formData.updateDate, formData.id]
              ]
            },
            auth: auth
          }
          sheets.spreadsheets.values.append(newEntry, (err, res) => {
            if (err) reject(err)
            resolve('Sucess')
          })
        })
      },
      writeDataToFile (data) {
        const component = this
        let fileName = data.id
        mkdirp(fileLoc, function (err) {
          if (err) alert('Data was not saved please write it somewhere', err)
          // path exists unless there was an error
          fs.writeFile(path.join(fileLoc, fileName), JSON.stringify(data), (err) => {
            if (err) alert('Data was not saved please write it somewhere', err)
            component.loadFormData(component.auth)
          })
        })
      },
      readOfflineRows () {
        const component = this
        fs.readdir(fileLoc, (err, files) => {
          if (err) return console.error(err)
          files.forEach(file => {
            component.offLineRowIds.push(file)
            fs.readFile(path.join(fileLoc, file), (err, content) => {
              if (err) return console.log('Error loading data file:', err)
              let offLineRowData = JSON.parse(content)
              offLineRowData.entryDate = this.toDate(offLineRowData.entryDate)
              offLineRowData.createdDate = new Date(offLineRowData.createdDate)
              offLineRowData.updateDate = new Date(offLineRowData.updateDate)
              offLineRowData.sno = Number(offLineRowData.sno)
              offLineRowData.pakkaAmt = Number(offLineRowData.pakkaAmt)
              offLineRowData.kachaAmt = Number(offLineRowData.kachaAmt)
              component.rows.push(offLineRowData)
            })
          })
        })
      },
      uploadOfflineRows () {
        const component = this
        fs.readdir(fileLoc, (err, files) => {
          if (err) return console.error(err)
          files.forEach(file => {
            fs.readFile(path.join(fileLoc, file), (err, content) => {
              if (err) return console.log('Error loading data file:', err)
              // Authorize a client with credentials, then call the Google Sheets API.
              const rowData = JSON.parse(content)

              if (component.findRowOnline(rowData) === undefined) {
                console.log('row never uploaded creating new entry')
                component.writeDataOnline(rowData).then(() => {
                  fs.unlinkSync(path.join(fileLoc, file))
                }).catch((err) => {
                  console.log('upload failed will retry again later', err)
                })
              } else {
                console.log('row exists already updating it')
                component.updateOnlineRow(rowData, this.findRowOnline(rowData)).then(() => {
                  fs.unlinkSync(path.join(fileLoc, file))
                }).catch((err) => {
                  console.log('upload failed will retry again later: ', err)
                })
              }
            })
          })
        })
      },
      loadRowToEdit (editRow) {
        this.form = {...editRow}
      },
      findRowPosition (updatedRow) {
        if (this.offLineRowIds.includes(updatedRow.id)) {
          console.log('file saved offline overwrite it')
          this.writeDataToFile(updatedRow)
        } else {
          this.updateOnlineRow(updatedRow, this.findRowOnline(updatedRow)).then(() => {
            this.loadFormData(this.auth)
          }).catch((err) => {
            console.log('error uploading file saving it', err)
            this.writeDataToFile(updatedRow)
          })
        }
      },
      findRowOnline (rowData) {
        let i = 0
        if (this.rows != null) {
          for (let index in this.cachedOnLineRows) {
            i += 1
            if (this.cachedOnLineRows[index].id === rowData.id) {
              console.log("IT'S A MATCH! i= " + i)
              let rangeToUpdate = 'A' + (i + 1) + ':J' + (i + 1) // row to be updated
              return rangeToUpdate
            }
          }
        }
      },
      updateOnlineRow (form, range) {
        return new Promise((resolve, reject) => {
          const auth = this.auth
          const sheets = google.sheets({version: 'v4', auth})
          let updateEntry = {
            spreadsheetId: store.get('docId'),
            range: 'Sheet1!' + range,
            valueInputOption: 'RAW',
            resource: {
              values: [
                [form.sno, form.entryDate, form.company, form.partyNo, form.pakkaAmt, form.kachaAmt, form.boxes, form.createdDate, form.updateDate, form.id]
              ]
            },
            auth: auth
          }
          sheets.spreadsheets.values.update(updateEntry, (err, res) => {
            if (err) return reject(err)
            resolve('Success')
          })
        })
      },
      toDate (dateStr) {
        const [day, month, year] = dateStr.split('/')
        return new Date(year, month - 1, day)
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
  
  .error {
    color: red
  }
</style>
