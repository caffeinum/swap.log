const IPFS = require('ipfs')
const Room = require('ipfs-pubsub-room')

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

  const room = Room(ipfs, 'swap.online')

  room.on('peer joined', (peer) => console.log('peer ' + peer + ' joined'))
  room.on('peer left', (peer) => console.log('peer ' + peer + ' left'))

  // log messages
  room.on('message', (message) => console.log('got message from ' + message.from + ': ' + message.data.toString()))
}))

function repo () {
  return '.ipfs/pubsub-demo/' + Math.random()
}
