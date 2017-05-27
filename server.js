const fs = require('fs')
const EventsReader = require('n-readlines')
const uuid = require('uuid')
const app = require('express')()
const sockets = require('express-ws')(app)

// ----------------------------------------------------------------------------
// State management
// ----------------------------------------------------------------------------

// in-memory datastore for storing current state of cards
const cards = { }

// handlers for events
const handlers = {
  ADD_CARD ({ ts, id = uuid.v1(), text = '', major = [], minor =[] } = {}) {
    if (cards[id]) return
    cards[id] = { text, major, minor }
    console.log(ts, 'CARD ADDED', id, cards[id])
  },
  REMOVE_CARD ({ ts, id }) {
    if (!cards[id]) return
    delete cards[id]
    console.log(ts, 'CARD REMOVED', id)
  },
  CHANGE_TEXT ({ ts, id, text }) {
    if (!cards[id]) return
    cards[id].text = text
    console.log(ts, 'TEXT CHANGED', id, text)
  },
  VOTE_MAJOR ({ ts, id, user }) {
    if (!cards[id]) return
    console.log(ts, 'ADDING USER MAJOR VOTE', id, user, cards[id].major)
    const i = cards[id].major.indexOf(user)
    if (i == -1) cards[id].major.push(user)
    console.log(ts, 'ADDED USER MAJOR VOTE', id, user, cards[id].major)
  },
  VOTE_MINOR ({ ts, id, user }) {
    if (!cards[id]) return
    console.log(ts, 'ADDING USER MINOR VOTE', id, user, cards[id].minor)
    const i = cards[id].minor.indexOf(user)
    if (i == -1) cards[id].minor.push(user)
    console.log(ts, 'ADDED USER MINOR VOTE', id, user, cards[id].minor)
  },
  UNVOTE_MAJOR ({ ts, id, user }) {
    if (!cards[id]) return
    console.log(ts, 'REMOVING USER MAJOR VOTE', id, user, cards[id].major)
    const i = cards[id].major.indexOf(user)
    if (i > -1) cards[id].major.splice(i)
    console.log(ts, 'REMOVED USER MAJOR VOTE', id, user, cards[id].major)
  },
  UNVOTE_MINOR ({ ts, id, user }) {
    if (!cards[id]) return
    console.log(ts, 'REMOVING USER MINOR VOTE', id, user, cards[id].minor)
    const i = cards[id].minor.indexOf(user)
    if (i > -1) cards[id].minor.splice(i)
    console.log(ts, 'REMOVED USER MINOR VOTE', id, user, cards[id].minor)
  }
}

// this method handles one event
function handleEvent (event) {
  const handler = handlers[event.cmd] || function() { console.log('UNKNOWN COMMAND') }
  handler(event)
}

// this method reads past events stored in the './events' file
function readPastEvents () {
  const events = new EventsReader('./events')
  let event
  while (event = events.next()) {
    event = JSON.parse(event.toString())
    handleEvent(event)
  }
}

function storeEvent (event) {
  return new Promise(function(resolve, reject) {
    fs.appendFile('events', JSON.stringify(event) + '\n', function(err) {
      if (err) reject(err)
      else resolve(event)
    })
  })
}

// ----------------------------------------------------------------------------
// Web - middlewares (CORS)
// ----------------------------------------------------------------------------

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// ----------------------------------------------------------------------------
// Web - REST API
// ----------------------------------------------------------------------------

app.get('/api/cards', function (req, res) {
  res.json(cards);
})

app.get('/api/cards/:id', function (req, res) {
  const card = cards[req.params.id]
  if (card) {
    res.json(card)
  } else {
    res.sendStatus(404).status('Card not found')
  }
})

// ----------------------------------------------------------------------------
// Web - websockets
// ----------------------------------------------------------------------------

const clients = []

app.ws('/api/updates', (ws, req) => {
  // register connected user
  clients.push(ws)
  console.log('Client added: ', clients.length)

  ws.on('close', function() {
    // unregister user when disconnected
    clients.splice(clients.indexOf(ws), 1)
    console.log('Client removed: ', clients.length)
  })

  ws.on('message', msg => {
    try {
      // the message comes in as JSON string - convert to object
      const event = JSON.parse(msg)

      // update timestamp
      event.ts = event.ts || new Date().getTime()

      // append command to event log
      storeEvent(event).then(handleEvent).catch(console.error)
    } catch (e) {
      console.error('ERROR: ', e)
    }

    // broadcast command to other clients
    clients.filter(client => client != ws).forEach(client => client.send(msg))
  })
})

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

readPastEvents()

app.listen(3001, function () {
  console.log('Server ready')
})
