<template>
  <div>
    <el-table
    stripe
    border
    :data="rows.filter(data => !search || data.company.toLowerCase().includes(search.toLowerCase()) || data.partyNo.toLowerCase().includes(search.toLowerCase()))"
    :default-sort = "{prop: 'entryDate', order: 'descending'}"
    max-height="500"
    style="width: 100%">
      <el-table-column
        prop="entryDate"
        sortable
        fixed
        label="Date">
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
        label="Boxes"
        sortable>
      </el-table-column>
      <el-table-column
        prop="createdDate"
        sortable
        label="Created">
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
          <el-button
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
export default {
  name: 'major-list',
  props: ['rows'],
  data () {
    return {
      search: ''
    }
  },
  methods: {
    editRow (row) {
      console.log(row)
      this.$emit('editRow', row)
    }
  }
}
</script>
