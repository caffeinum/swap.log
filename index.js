const IPFS = require('ipfs')
const Room = require('ipfs-pubsub-room')

const http = require('http')

let logs = []

const ipfs = new IPFS({
  repo: repo(),
  EXPERIMENTAL: {
    pubsub: true
  },
  config: {
    Addresses: {
      Swarm: [
        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
        '/dns4/discovery.libp2p.array.io/tcp/9091/wss/p2p-websocket-star',
        '/dns4/star.wpmix.net/tcp/443/wss/p2p-websocket-star',
      ]
    }
  }
})

ipfs.once('ready', () => ipfs.id((err, info) => {
  if (err) { throw err }
  console.log('IPFS node ready with address ' + info.id)

  const roomName = process.argv[2] || 'testnet.swap.online'
  console.log('Logging messages from room ' + roomName)

  const room = Room(ipfs, roomName)

  room.on('peer joined', (peer) => console.log('peer ' + peer + ' joined'))
  room.on('peer left', (peer) => console.log('peer ' + peer + ' left'))

  // log messages
  room.on('message', (message) => console.log('got message from ' + message.from + ': ' + message.data.toString()))

  room.on('peer joined',  (peer) => logs.push({ join: peer }))
  room.on('peer left',    (peer) => logs.push({ left: peer }))
  room.on('message',      ({ from, data }) => logs.push({ from, data: data.toString() }))

  startServer({
    id: info.id,
    room: roomName,
    // peer: room.peer,
  })
}))

function repo () {
  return '.ipfs/pubsub-demo/' + Math.random()
}

const startServer = (ipfs_info) => {
  http.createServer((req, res) => {
    try {
      console.log(req.url)

      let resp
      if ( req.url == '/full' ) {
        resp = logs
      } else if ( req.url == '/me' ) {
        resp = ipfs_info
      } else {
        resp = logs.slice(1).slice(-10)
      }

      res.writeHead(200, {'Content-Type': 'application/json'})
      res.write(JSON.stringify(resp))
      res.end()
    } catch (err) {
      res.writeHead(500, {'Content-Type': 'application/json'})
      res.write(JSON.stringify(err))
      res.end()
    }
  }).listen(8888)
}
