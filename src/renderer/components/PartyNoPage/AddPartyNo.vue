<template>
  <div id="wrapper">
    <el-form inline ref="partyNo" :model="partyNo" label-width="120px">
        <el-form-item label="PartyNo">
          <el-input v-model="partyNo.name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onClick">Submit</el-button>
          <el-button @click="resetForm('partyNo')">Cancel</el-button>
        </el-form-item>
      </el-form>
  </div>
</template>
<script>

import authMixin from '../../mixins/authMixin'
const {google} = require('googleapis')
const electron = require('electron')
const Store = require('electron-store')
const store = new Store()

const remote = electron.remote
export default {
  name: 'partyNo-page',
  mixins: [authMixin],
  data () {
    return {
      partyNo: {
        name: ''
      },
      auth: {}
    }
  },
  created () {
    if (store.has('docId')) {
      this.spreadsheetId = store.get('docId')
      if (store.has('credentials.json')) {
        this.authorize(JSON.parse(store.get('credentials.json')), this.saveClientAuth)
      } else {
        this.connectionError = 'credentials not found'
      }
    } else {
      this.connectionError = 'docId not set'
    }
  },
  methods: {
    onClick () {
      console.log('submit!')
      var window = remote.getCurrentWindow()
      this.insertNewPartyNo(this.partyNo.name)
      window.close()
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    saveClientAuth (auth) {
      console.log('retrieved auth for session')
      this.auth = auth
    },
    insertNewPartyNo (partyName) {
      let auth = this.auth
      const sheets = google.sheets({version: 'v4', auth})
      let newCompanyReq = {
        spreadsheetId: store.get('docId'),
        range: 'PartyNo!A1:A',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [
            [partyName]
          ]
        },
        auth: auth
      }
      sheets.spreadsheets.values.append(newCompanyReq, (err, res) => {
        if (err) console.log(err)
        console.log('Sucess')
      })
    }
  }
}
</script>
