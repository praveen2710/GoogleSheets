<template>
  <div>
    <div v-for="row in rows">
        <h3>{{row[0]}}</h3>
    </div>
    <p>dummy data</p>
    </div>
</template>
<script>
export default {
  name: 'major-list',
  props: ['rows']
}
</script>
