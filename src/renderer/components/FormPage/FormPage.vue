<template>
  <div>
    <el-form  :label-position="labelPosition" :inline="true" :model="form" ref="form" class="demo-form-inline" size="mini">
      <el-form-item label="Date">
        <el-date-picker
          v-model="form.date"
          type="date"
          placeholder="Pick a day"
          :picker-options="pickerOptions">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="Company">
        <el-input v-model="form.name" placeholder="Company Name"></el-input>
      </el-form-item>
      <el-form-item label="Party No">
        <el-input v-model="form.partyNo" placeholder="Party No"></el-input>
      </el-form-item>
      <el-form-item label="Pakka Amt">
        <el-input type="amount" v-model="form.pakkaAmt" placeholder="Pakka"></el-input>
      </el-form-item>
      <el-form-item label="Kacha Amt">
        <el-input v-model="form.kachaAmt" placeholder="Kacha"></el-input>
      </el-form-item>
      <el-form-item label="Boxes">
        <el-input v-model="form.boxes" placeholder="Boxes"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">Submit</el-button>
        <el-button @click="resetForm">Reset</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  const shortid = require('shortid')

  export default {
    props: ['auth'],
    data () {
      return {
        form: {
          id: 0,
          date: null,
          partyNo: '',
          name: '',
          pakkaAmt: 0,
          kachaAmt: 0,
          boxes: 0,
          createdDate: null
        },
        show: true,
        pickerOptions: {
          disabledDate (time) {
            return time.getTime() > Date.now()
          },
          shortcuts: [{
            text: 'Today',
            onClick (picker) {
              picker.$emit('pick', new Date())
            }
          }, {
            text: 'Yesterday',
            onClick (picker) {
              const date = new Date()
              date.setTime(date.getTime() - 3600 * 1000 * 24)
              picker.$emit('pick', date)
            }
          }, {
            text: 'A week ago',
            onClick (picker) {
              const date = new Date()
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', date)
            }
          }]
        },
        labelPosition: 'top',
        pos2: 'left'
      }
    },
    methods: {
      onSubmit (evt) {
        evt.preventDefault()
        this.form.id = shortid.generate()
        this.form.createdDate = new Date()
        this.$emit('newRow', this.form)
        this.resetForm()
      },
      resetForm () {
        this.form.id = 0
        this.form.date = null
        this.form.partyNo = ''
        this.form.name = ''
        this.form.pakkaAmt = 0
        this.form.kachaAmt = 0
        this.form.boxes = 0
        this.form.createdDate = null
      }
    }
  }
</script>