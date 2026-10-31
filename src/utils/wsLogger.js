import WsLog from '../schemas/wsLog.schema.js'
import { roomManager } from '../core/rooms/room.manager.js'
import fastifyInstance from '../core/fastify.instance.js'

const DEFAULT_UPDATE_MESSAGE = 'Оновлено дані персонажа'

// Events the generic onAny listener should never raw-dump: most are logged
// explicitly (with a computed diff or a built message) by their own handler
// instead; session:connectCharacter/session:leave are intentionally not
// logged at all - listed here purely to keep them silent.
const DETAILED_EVENTS = new Set([
    'character:updateData',
    'character:rollDice',
    'session:connectCharacter',
    'session:disconnectCharacter',
    'session:leave'
])

// Logging must never sit in the critical path of a character/session update -
// a burst of fast actions (adding/removing items, etc.) would otherwise queue
// up behind their own log writes on the same DB connection pool. So log calls
// only push a plain object into memory; an interval drains it with a single
// batched insert, well off the hot path.
const QUEUE_FLUSH_MS = 1000
const QUEUE_MAX_SIZE = 200

let queue = []

function enqueue(doc) {
    queue.push({ ...doc, createdAt: new Date() })
    if (queue.length >= QUEUE_MAX_SIZE) flushQueue()
}

function flushQueue() {
    if (!queue.length) return

    const batch = queue
    queue = []

    WsLog.insertMany(batch, { ordered: false }).catch((error) => {
        fastifyInstance.server.log.error(error, 'Failed to persist a batch of websocket logs')
    })
}

setInterval(flushQueue, QUEUE_FLUSH_MS).unref()

function getSocketContext(socket) {
    const sessionId = [...socket.rooms].find((room) => room !== socket.id) || null
    if (!sessionId) return { sessionId: null, characterId: null, role: null }

    const room = roomManager.get(sessionId)
    const member = room?.members.get(socket.id)

    return {
        sessionId,
        characterId: member?.userId || null,
        role: member?.role || null
    }
}

function summarizePayload(args) {
    if (!args || args.length === 0) return null

    try {
        const json = JSON.stringify(args)
        return json.length > 1000 ? `${json.slice(0, 1000)}…` : json
    } catch {
        return null
    }
}

export function logSocketEvent(socket, event, args) {
    if (DETAILED_EVENTS.has(event)) return

    const { sessionId, characterId, role } = getSocketContext(socket)

    enqueue({
        event,
        sessionId,
        characterId,
        role,
        socketId: socket.id,
        payload: summarizePayload(args)
    })
}

// `message` is built by the client - it already knows exactly what the user
// just did (which item/perk, how much experience, which health field, etc.)
// without needing to reverse-engineer it from a before/after diff server-side.
// `diff` is kept only as raw debug payload, not used to derive the message.
export function logDataChange(socket, { event, sessionId, characterId, diff, message }) {
    const { role } = getSocketContext(socket)

    const payload = diff
        ? JSON.stringify(diff).slice(0, 2000)
        : 'Без змін'

    enqueue({
        event,
        sessionId,
        characterId,
        role,
        socketId: socket.id,
        payload,
        message: message || DEFAULT_UPDATE_MESSAGE
    })
}

export function logAction(socket, { event, sessionId, characterId, role, message }) {
    if (sessionId === undefined || characterId === undefined || role === undefined) {
        const context = getSocketContext(socket)
        if (sessionId === undefined) sessionId = context.sessionId
        if (characterId === undefined) characterId = context.characterId
        if (role === undefined) role = context.role
    }

    enqueue({
        event,
        sessionId,
        characterId,
        role,
        socketId: socket.id,
        payload: message,
        message
    })
}
