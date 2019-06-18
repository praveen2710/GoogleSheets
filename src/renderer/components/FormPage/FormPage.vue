<template>
  <div>
    <h2>Add/Edit Entry</h2>
    <el-form  :label-position="labelPosition" :inline="true" :rules="rules" :model="form" ref="form" class="demo-form-inline" size="mini">
      <el-form-item label="SNO" prop="sno">
        <el-input-number v-model="form.sno" :min="0" :max="10000"></el-input-number>
      </el-form-item>
      <el-form-item label="Date" prop="entryDate">
        <el-date-picker
          v-model="form.entryDate"
          type="date"
          placeholder="Pick a day"
          :picker-options="pickerOptions">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="Party No" prop="partyNo">
        <el-select v-model="form.partyNo" placeholder="please select your zone" filterable>
          <el-option v-for="partyNo in partyNoList"
            :key="partyNo"
            :label="partyNo"
            :value="partyNo">
          </el-option>
        </el-select>
      </el-form-item>   
      <el-form-item label="Boxes" prop="boxes" :rules="[
      { required: true, message: 'amount is required'},
      { type: 'number', message: 'amount must be a number'}
      ]">
        <el-input v-model.number="form.boxes" placeholder="Kacha"></el-input>
      </el-form-item>
      <el-form-item label="Loose" prop="loose">
        <el-input v-model="form.loose" placeholder="Boxes"></el-input>
      </el-form-item>
      <el-form-item label="Action">
        <el-button type="primary" @click="onSubmit('form')">Submit</el-button>
        <el-button @click="resetForm('form')">Reset</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  const shortid = require('shortid')

  export default {
    props: ['form', 'companyList', 'partyNoList'],
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
          sno: [
            { required: true, message: 'Please input SNO' }
          ],
          entryDate: [
            { type: 'date', required: true, message: 'Please pick a date', trigger: 'change' }
          ],
          partyNo: [
            { required: true, message: 'Please input partyNo name' }
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
            this.form.entryDate = this.convertDate(this.form.entryDate)
            if (this.form.id === '') {
              this.form.id = shortid.generate()
              this.form.createdDate = new Date()
              this.form.updateDate = new Date()
              this.$emit('newRow', {...this.form})
            } else {
              this.form.updateDate = new Date()
              this.$emit('updatedRow', {...this.form})
            }
            this.resetForm(formName)
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
      resetForm (formName) {
        this.form.id = ''
        this.form.createdDate = null
        this.form.updateDate = null
        this.$refs[formName].resetFields()
      },
      convertDate (inputFormat) {
        function pad (s) { return (s < 10) ? '0' + s : s }
        var d = new Date(inputFormat)
        return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/')
      }
    }
  }
</script>