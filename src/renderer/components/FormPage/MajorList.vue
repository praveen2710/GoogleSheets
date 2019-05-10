<template>
  <div>
    <h2>Entries List</h2>
    <el-table
    stripe
    border
    :data="rows.filter(data => !search || data.company.toLowerCase().includes(search.toLowerCase()) || data.partyNo.toLowerCase().includes(search.toLowerCase()))"
    :default-sort = "{prop: 'updateDate', order: 'descending'}"
    max-height="500"
    style="width: 100%">
      <el-table-column
        prop="entryDate"
        sortable
        fixed
        label="Date"
        :formatter="entryDateFormatting">
      </el-table-column>
      <el-table-column
        prop="company"
        label="Company"
        fixed
        sortable>
      </el-table-column>
      <el-table-column
        prop="partyNo"
        label="Party No"
        sortable>
      </el-table-column>
      <el-table-column
        prop="pakkaAmt"
        label="Pakka"
        sortable>
      </el-table-column>
      <el-table-column
        prop="kachaAmt"
        label="Kaccha"
        sortable>
      </el-table-column>
      <el-table-column
        prop="boxes"
        label="Boxes">
      </el-table-column>
      <el-table-column
        prop="updateDate"
        sortable
        label="Last Updated"
        :formatter="noOfDaysFormatting">
      </el-table-column>
      <el-table-column
      align="right">
        <template slot="header" slot-scope="scope">
          <el-input
            v-model="search"
            size="mini"
            placeholder="Search"/>
        </template>
        <template slot-scope="scope">
          <el-button :disabled="disableEdit(scope.row.createdDate)"
            @click.native.prevent="editRow(scope.row)"
            type="text"
            size="small">
            Edit
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>

var moment = require('moment')

export default {
  name: 'major-list',
  props: ['rows'],
  data () {
    return {
      search: ''
    }
  },
  computed: {

  },
  methods: {
    editRow (row) {
      this.$emit('editRow', row)
    },
    disableEdit (creationDate) {
      var ONE_DAY = 1000 * 60 * 60 * 24
      var diff = new Date() - new Date(creationDate)
      return (diff / ONE_DAY) > 7
    },
    entryDateFormatting (row, column) {
      var date = row[column.property]
      if (date === undefined) {
        return 'Error'
      }
      return moment(date).format('MMM Do YY')
    },
    noOfDaysFormatting (row, column) {
      var date = row[column.property]
      if (date === undefined) {
        return 'Error'
      }
      return moment(date).startOf('minute').fromNow()
    }
  }
}
</script>
