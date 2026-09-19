import { socketErrorHandler } from '../config/socketErrorHandler.js';
import { roomManager } from '../core/rooms/room.manager.js';
import fastifyInstance from '../core/fastify.instance.js';
import { getSessionName } from '../service/session.service.js';
import { getCharacterName } from '../service/character.service.js';
import { RECONNECTION_GRACE_MS } from '../config/socket.constants.js';

const registerRoomHandler = (io, socket) => {
    const fastify = fastifyInstance.server;

    socket.on('session:join', async (sessionId, { role }) => {
        try {
            const sessionName = await getSessionName(sessionId);

            const session = roomManager.join(socket.id, sessionId, role);

            socket.join(sessionId);

            io.to(sessionId).emit('session:update', {
                room: session.toJSON()
            });

            socket.emit('session:join', {
                room: session.toJSON()
            });

            fastify.log.info(`User joined session ${sessionName} (socketId: ${socket.id}, sessionId: ${sessionId}, role: ${role})`);
        } catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    socket.on('session:leave', (sessionId) => {
        const session = roomManager.leave(socket.id, sessionId);

        socket.leave(sessionId);

        if (session && session.members.size) {
            io.to(sessionId).emit('session:update', {
                room: roomManager.get(sessionId).toJSON()
            });
        }

        fastify.log.info(`User left session (socketId: ${socket.id}, sessionId: ${sessionId})`);
    });

    socket.on('session:reconnect', async (sessionId, { role, characterId }) => {
        try {
            const sessionName = await getSessionName(sessionId);

            const session = roomManager.getOrCreate(sessionId);

            session.addMember(socket.id, role);
            if (characterId) {
                session.connectCharacterToMember(socket.id, characterId);
            }
            socket.join(sessionId);

            io.to(sessionId).emit('session:update', {
                room: session.toJSON(),
            });

            socket.emit('session:reconnect', {
                room: session.toJSON(),
            });

            const characterName = characterId
                ? await getCharacterName(characterId)
                : null;

            fastify.log.info(`User ${characterName ? `(${characterName}) ` : ''}reconnected to session (${sessionName}) (socketId: ${socket.id}, sessionId: ${sessionId}, characterId: ${characterId})`);
        } catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    socket.on('disconnect', (reason) => {
        fastify.log.info(`User disconnected, scheduling room cleanup (socketId: ${socket.id}, reason: ${reason})`);

        roomManager.scheduleLeaveAll(socket.id, RECONNECTION_GRACE_MS, (sessionIds) => {
            sessionIds.forEach((sessionId) => {
                const session = roomManager.get(sessionId);

                if (session && session.members.size) {
                    io.to(sessionId).emit('session:update', {
                        room: session.toJSON()
                    });
                }
            });

            fastify.log.info(`User disconnected (socketId: ${socket.id})`);
        });
    });
};

export default registerRoomHandler;
