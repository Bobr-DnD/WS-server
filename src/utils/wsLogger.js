import WsLog from '../schemas/wsLog.schema.js'
import { roomManager } from '../core/rooms/room.manager.js'
import fastifyInstance from '../core/fastify.instance.js'
import { formatDiffMessage } from './logFormatters.js'

// These events are logged explicitly (with a computed diff or a built message)
// by their handlers, so the generic onAny listener should not also log a raw duplicate.
const DETAILED_EVENTS = new Set([
    'character:updateData',
    'session:connectCharacter',
    'session:disconnectCharacter'
])

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

    WsLog.create({
        event,
        sessionId,
        characterId,
        role,
        socketId: socket.id,
        payload: summarizePayload(args)
    }).catch((error) => {
        fastifyInstance.server.log.error(error, 'Failed to persist websocket log')
    })
}

export async function logDataChange(socket, { event, sessionId, characterId, diff }) {
    const { role } = getSocketContext(socket)

    const payload = diff
        ? JSON.stringify(diff).slice(0, 2000)
        : 'Без змін'

    try {
        const message = await formatDiffMessage(diff)

        await WsLog.create({
            event,
            sessionId,
            characterId,
            role,
            socketId: socket.id,
            payload,
            message
        })
    } catch (error) {
        fastifyInstance.server.log.error(error, 'Failed to persist websocket log')
    }
}

export async function logAction(socket, { event, sessionId, characterId, message }) {
    const { role } = getSocketContext(socket)

    try {
        await WsLog.create({
            event,
            sessionId,
            characterId,
            role,
            socketId: socket.id,
            payload: message,
            message
        })
    } catch (error) {
        fastifyInstance.server.log.error(error, 'Failed to persist websocket log')
    }
}
