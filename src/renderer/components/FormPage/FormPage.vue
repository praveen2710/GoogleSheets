<template>
  <div>
    <h2>Add/Edit Entry</h2>
    <el-form  :label-position="labelPosition" :inline="true" :rules="rules" :model="form" ref="form" class="demo-form-inline" size="mini">
      <el-form-item label="Date" prop="entryDate">
        <el-date-picker
          v-model="form.entryDate"
          type="date"
          placeholder="Pick a day"
          :picker-options="pickerOptions">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="Company" prop="company">
        <el-input v-model="form.company" placeholder="Company Name"></el-input>
      </el-form-item>
      <el-form-item label="Party No" prop="partyNo">
        <el-input v-model="form.partyNo" placeholder="Party No"></el-input>
      </el-form-item>
      <el-form-item label="Pakka Amt"  prop="pakkaAmt" :rules="[
      { required: true, message: 'amount is required'},
      { type: 'number', message: 'amount must be a number'}
      ]"> 
        <el-input type="amount" v-model.number="form.pakkaAmt" placeholder="Pakka"></el-input>
      </el-form-item>
      <el-form-item label="Kacha Amt" prop="kachaAmt" :rules="[
      { required: true, message: 'amount is required'},
      { type: 'number', message: 'amount must be a number'}
      ]">
        <el-input v-model.number="form.kachaAmt" placeholder="Kacha"></el-input>
      </el-form-item>
      <el-form-item label="Boxes" prop="boxes">
        <el-input v-model="form.boxes" placeholder="Boxes"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit('form')">Submit</el-button>
        <el-button @click="resetForm('form')">Reset</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  const shortid = require('shortid')

  export default {
    props: ['form'],
    data () {
      return {
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
        rules: {
          entryDate: [
            { type: 'date', required: true, message: 'Please pick a date', trigger: 'change' }
          ],
          company: [
            { required: true, message: 'Please input Company name' }
          ],
          partyNo: [
            { required: true, message: 'Please input partyNo name' }
          ],
          pakkaAmt: [
            { required: true, message: 'amount is required' },
            { type: 'number', message: 'amount must be a number' }
          ],
          kachaAmt: [
            { required: true, message: 'amount is required' },
            { type: 'number', message: 'amount must be a number' }
          ],
          boxes: [
            { required: true, message: 'Please input boxes detail' }
          ]
        },
        labelPosition: 'top',
        pos2: 'left'
      }
    },
    methods: {
      onSubmit (formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if (this.form.id === undefined) {
              this.form.id = shortid.generate()
              this.form.createdDate = new Date()
              this.form.updateDate = new Date()
              this.$emit('newRow', this.form)
            } else {
              this.form.updateDate = new Date()
              this.$emit('updatedRow', this.form)
            }
            this.$refs[formName].resetFields()
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
      resetForm (formName) {
        this.$refs[formName].resetFields()
        this.$emit('reset')
      }
    }
  }
</script>