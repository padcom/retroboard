<template>
  <div id="app">
    <p>
      <button @click="addCard">Add card</button>
      <select @change="selectUser($event.target.value)">
        <option v-for="user in [ 'maciej', 'john', 'jane' ]">{{ user }}</option>
      </select>
    </p>
    <h4>Major vote</h4>
    <ul>
      <li v-for="vote in userMajorVotes">{{ vote }}</li>
    </ul>
    <h4>Minor vote(s)</h4>
    <ul>
      <li v-for="vote in userMinorVotes">{{ vote }}</li>
    </ul>
    <table>
      <Card v-for="(card, id) in cards" :id="id" :card="card" key="card.id" />
    </table>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Card from './components/Card'

export default {
  name: 'app',
  components: {
    Card
  },
  mounted () {
    this.$store.dispatch('LOAD_CARDS')
  },
  methods: {
    isLastCard (index) {
      return index < this.cards.length - 1
    },
    addCard () {
      this.$store.dispatch('ADD_CARD')
    },
    selectUser (user) {
      this.$store.commit('SET_USER', { user })
    }
  },
  computed: {
    ...mapState([
      'cards'
    ]),
    ...mapGetters([
      'userMajorVotes', 'userMinorVotes'
    ])
  }
}
</script>

<style>
@import "~normalize.css"

* {
  box-sizing: border-box;
}

html {
  padding: 10px;
}
</style>
