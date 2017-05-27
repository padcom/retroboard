<template>
  <div class="card">
    <div class="vote">
      <textarea @keyup="updateText($event.target.value)" :value="card.text" />
    </div>
    <div class="vote">
      <label>BIG: {{ card.major.length }}</label>
      <button @click="VOTE_MAJOR({ id })" v-show="!userVotedMajor(id)" :disabled="!userCanCastMajorVote">
        Vote
      </button>
      <button @click="UNVOTE_MAJOR({ id })" v-show="userVotedMajor(id)">
        Unvote
      </button>
    </div>
    <div class="vote">
      <label>SMALL: {{ card.minor.length }}</label>
      <button @click="VOTE_MINOR({ id })" v-show="!userVotedMinor(id)" :disabled="!userCanCastMinorVote">
        Vote
      </button>
      <button @click="UNVOTE_MINOR({ id })" v-show="userVotedMinor(id)">
        Unvote
      </button>
    </div>
    <div class="vote">
      <button @click="remove">Remove</button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'card',
  props: {
    id: { required: true, type: String },
    card: { required: true, type: Object }
  },
  computed: {
    ...mapState([
      'cards', 'user'
    ]),
    ...mapGetters([
      'userCanCastMajorVote', 'userCanCastMinorVote',
      'userVotedMajor', 'userVotedMinor'
    ])
  },
  methods: {
    ...mapActions([
      'VOTE_MAJOR', 'UNVOTE_MAJOR',
      'VOTE_MINOR', 'UNVOTE_MINOR'
    ]),
    updateText (text) {
      if (this.card.text !== text) {
        this.$store.dispatch('CHANGE_TEXT', { id: this.id, text })
      }
    },
    remove () {
      this.$store.dispatch('REMOVE_CARD', { id: this.id })
    }
  }
}
</script>

<style>
  .card {
    display: flex;
    width: 100%;
    border: solid 1px gray;
    margin: auto;
    margin-bottom: 10px;
  }
  label {
    font-weight: bold;
  }
  button {
    min-width: 80px;
    margin: 5px;
  }
  textarea {
    flex-grow: 1;
    width: 500px;
    border: solid 1px black;
    resize: none;
  }
  .vote {
    text-align: center;
    display: flex;
    flex-direction: column;
    margin: auto;
    padding: 3px;
  }
  td {
    text-align: center;
    vertical-align: bottom;
  }
</style>
