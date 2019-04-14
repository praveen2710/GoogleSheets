<template>
  <div>
    <b-form @submit="onSubmit" @reset="onReset" v-if="show">
      <b-form-group id="exampleInputGroup2" label="Your Name:" label-for="exampleInput2">
        <b-form-input
          id="exampleInput2"
          type="text"
          v-model="form.name"
          required
          placeholder="Enter name" />
          <b-form-input
          id="exampleInput2"
          type="number"
          v-model="form.amount"
          required
          placeholder="Enter amount" />
      </b-form-group>

      <b-button type="submit" variant="primary">Submit</b-button>
      <b-button type="reset" variant="danger">Reset</b-button>
    </b-form>
  </div>
</template>

<script>
  const {google} = require('googleapis')

  export default {
    props: ['auth'],
    data () {
      return {
        form: {
          name: ''
        },
        show: true
      }
    },
    methods: {
      onSubmit (evt) {
        evt.preventDefault()
        this.addNewStudent(this.auth, this.form)
      },
      onReset (evt) {
        evt.preventDefault()
        /* Reset our form values */
        this.form.email = ''
        this.form.name = ''
        this.form.food = null
        this.form.checked = []
        /* Trick to reset/clear native browser form validation state */
        this.show = false
        this.$nextTick(() => {
          this.show = true
        })
      },
      /**
       * Prints the names and majors of students in a sample spreadsheet:
       * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
       * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
       */
      addNewStudent (auth, form) {
        const sheets = google.sheets({version: 'v4', auth})
        sheets.spreadsheets.values.append({
          spreadsheetId: '14pkSLWxLYMdPO5eYyW0cEV657g1sExqh-5t-k3wfivg',
          range: 'Sheet1!A2:F',
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: [
              [form.name, form.amount]
            ]
          },
          auth: auth
        }, (err, res) => {
          if (err) return console.log('The API returned an error: ' + err)
        })
      }
    }
  }
</script>