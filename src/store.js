import Vue from 'vue'
import Vuex from 'vuex'
import WebSocket from 'reconnecting-websocket'
import uuid from 'uuid'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    cards: { },
    user: 'jane'
  },
  getters: {
    userMajorVotes: (state, getters) =>
      Object.keys(state.cards)
        .filter(id => state.cards[id].major.indexOf(state.user) > -1),
    userMinorVotes: (state, getters) =>
      Object.keys(state.cards)
        .filter(id => state.cards[id].minor.indexOf(state.user) > -1),

    userCanCastMajorVote: (state, getters) => getters.userMajorVotes.length < 1,
    userCanCastMinorVote: (state, getters) => getters.userMinorVotes.length < 2,

    userVotedMajor: (state, getters) => (id) => state.cards[id].major.indexOf(state.user) > -1,
    userVotedMinor: (state, getters) => (id) => state.cards[id].minor.indexOf(state.user) > -1
  },
  actions: {
    async LOAD_CARDS ({ commit }) {
      const cards = await fetch('/api/cards', {
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache' }
      }).then(response => response.json())
      commit('SET_CARDS', { cards })
    },
    ADD_CARD ({ commit }) {
      command({ cmd: 'ADD_CARD', id: uuid.v1(), card: { text: '', major: [], minor: [] } })
    },
    REMOVE_CARD ({ commit }, { id }) {
      command({ cmd: 'REMOVE_CARD', id })
    },
    CHANGE_TEXT ({ commit }, { id, text }) {
      command({ cmd: 'CHANGE_TEXT', id, text })
    },
    VOTE_MAJOR ({ state, commit }, { id }) {
      command({ cmd: 'VOTE_MAJOR', user: state.user, id })
    },
    VOTE_MINOR ({ state, commit }, { id }) {
      command({ cmd: 'VOTE_MINOR', user: state.user, id })
    },
    UNVOTE_MAJOR ({ state, commit }, { id }) {
      command({ cmd: 'UNVOTE_MAJOR', user: state.user, id })
    },
    UNVOTE_MINOR ({ state, commit }, { id }) {
      command({ cmd: 'UNVOTE_MINOR', user: state.user, id })
    }
  },
  mutations: {
    SET_CARDS (state, { cards }) {
      state.cards = cards
    },
    SET_USER (state, { user }) {
      state.user = user
    },
    ADD_CARD (state, { id, card }) {
      Vue.set(state.cards, id, card)
    },
    REMOVE_CARD (state, { id }) {
      Vue.delete(state.cards, id)
    },
    CHANGE_TEXT (state, { id, text }) {
      if (state.cards[id]) {
        state.cards[id].text = text
      }
    },
    VOTE_MAJOR (state, { user, id }) {
      if (state.cards[id]) {
        state.cards[id].major.push(user)
      }
    },
    VOTE_MINOR (state, { user, id }) {
      if (state.cards[id]) {
        state.cards[id].minor.push(user)
      }
    },
    UNVOTE_MAJOR (state, { user, id }) {
      if (state.cards[id]) {
        let idx = state.cards[id].major.indexOf(user)
        if (idx > -1) {
          state.cards[id].major.splice(idx, 1)
        }
      }
    },
    UNVOTE_MINOR (state, { user, id }) {
      if (state.cards[id]) {
        let idx = state.cards[id].minor.indexOf(user)
        if (idx > -1) {
          state.cards[id].minor.splice(idx, 1)
        }
      }
    }
  }
})

let updates = new WebSocket('ws://' + global.window.location.host + '/api/updates')

function command (cmd) {
  store.commit(cmd.cmd, cmd)
  updates.send(JSON.stringify(cmd))
}

updates.addEventListener('message', function (e) {
  const cmd = JSON.parse(e.data)
  store.commit(cmd.cmd, cmd)
})

export default store
