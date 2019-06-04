<template>
  <div id="wrapper">
    <el-form inline ref="company" :model="newCompany" label-width="120px">
        <el-form-item label="Company Name">
          <el-input v-model="newCompany.name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onClick">Submit</el-button>
          <el-button @click="resetForm('company')">Cancel</el-button>
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
  name: 'company-page',
  mixins: [authMixin],
  data () {
    return {
      newCompany: {
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
      this.insertNewCompany(this.newCompany.name)
      window.close()
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    saveClientAuth (auth) {
      console.log('retrieved auth for session')
      this.auth = auth
    },
    insertNewCompany (companyName) {
      let auth = this.auth
      const sheets = google.sheets({version: 'v4', auth})
      let newCompanyReq = {
        spreadsheetId: store.get('docId'),
        range: 'Companies!A2:A',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [
            [companyName]
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
<style>
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
</style>
