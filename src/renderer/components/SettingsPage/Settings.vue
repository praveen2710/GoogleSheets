<template>
  <div>
    <el-form inline ref="credentials" :model="creds" label-width="120px">
      <el-form-item label="Credentials">
        <el-input v-model="creds.cred"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onClick">Submit</el-button>
      </el-form-item>
    </el-form>

    <el-form ref="form" :model="form" label-width="120px">
      <el-form-item label="Doc Id">
        <el-input v-model="form.docId"></el-input>
      </el-form-item>
      <el-form-item label="Secret Code">
        <el-input v-model="form.code"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">Submit</el-button>
      </el-form-item>
    </el-form>
    <el-button type="primary" @click="onReset">RESET ALL</el-button>
    <p>{{authUrl}}</p>
  </div>
</template>
<script>
const Store = require('electron-store')
const store = new Store()
const {google} = require('googleapis')

export default {
  name: 'settings-page',
  data () {
    return {
      SCOPES: ['https://www.googleapis.com/auth/spreadsheets'],
      authUrl: '',
      form: {
        docId: '',
        code: ''
      },
      creds: {
        cred: ''
      }
    }
  },
  methods: {
    onSubmit () {
      console.log('submit!')
      store.set('code', this.form.code)
      store.set('docId', this.form.docId)
    },
    onClick () {
      console.log('save ceredentials')
      store.set('credentials.json', this.creds.cred)
      let credentials = JSON.parse(store.get('credentials.json'))
      const oAuth2Client = new google.auth.OAuth2(credentials.installed.client_id, credentials.installed.client_secret, credentials.installed.redirect_uris[0])
      this.authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: this.SCOPES
      })
    },
    onReset () {
      store.clear()
      this.form.code = ''
      this.form.docId = ''
      this.creds = {}
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