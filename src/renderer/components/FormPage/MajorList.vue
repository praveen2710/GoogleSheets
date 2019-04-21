<template>
  <div>
    <!-- <div v-for="row in rows">
        <p>{{row[0]}} , Rs {{row[1]}}<b-button @click="editRow(row)">Edit</b-button></p>
    </div> -->
    <b-table striped hover 
    :items="rows" 
    :fields="fields"
    :sort-by.sync="sortBy"
    :sort-desc.sync="sortDesc"></b-table>
    </div>
</template>
<script>
export default {
  name: 'major-list',
  props: ['rows'],
  data () {
    return {
      sortBy: 'date',
      sortDesc: true,
      fields: [
        {key: 'company', sortable: true},
        {key: 'amount', sortable: true},
        {key: 'date', sortable: true}
      ]
    }
  },
  methods: {
    editRow (row) {
      console.log(row)
    }
  }
}
</script>
