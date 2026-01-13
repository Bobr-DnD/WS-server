import { socketErrorHandler } from '../config/socketErrorHandler.js';
import { getSession, getSessionCharactersIds, getSessionName, updateSession, updateSessionMove } from '../service/session.service.js';
import { roomManager } from '../core/rooms/room.manager.js';
import { getCharacterName } from '../service/character.service.js';
import fastifyInstance from '../core/fastify.instance.js';

const registerSessionHandler = (io, socket) => {
    const fastify = fastifyInstance.server;

    socket.on('session:connectCharacter', async (sessionId, characterId) => {
        const session = roomManager.get(sessionId);
        if (!session) {
            socket.emit('error', { message: `Session with id ${sessionId} not found` });
            return;
        }

        if (!session.hasMember(socket.id)) {
            socket.emit('error', { message: `User with id ${socket.id} is not in session ${sessionId}` });
            return;
        }

        try {
            const characters = await getSessionCharactersIds(sessionId);
            const sessionCharacterIds = characters.map(String);
            if (sessionCharacterIds.includes(characterId)) {
                const session = roomManager.connectCharacterToMember(socket.id, sessionId, characterId);
                if (session) {
                    io.to(sessionId).emit('session:update', {
                        room: session.toJSON()
                    });

                    const characterName = characterId
                        ? await getCharacterName(characterId)
                        : null;

                    const sessionName = await getSessionName(sessionId);
                    fastify.log.info({
                        socketId: socket.id,
                        sessionId: sessionId,
                        characterId: characterId,
                    }, `User pick character ${characterName ? `(${characterName})` : 'unknown character'} in session (${sessionName})`);
                }
            }
        } catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    socket.on('session:disconnectCharacter', async (sessionId) => {
        const session = roomManager.get(sessionId);
        if (!session) {
            socket.emit('error', { message: `Session with id ${sessionId} not found` });
            return;
        }

        if (!session.hasMember(socket.id)) {
            socket.emit('error', { message: `User with id ${socket.id} is not in session ${sessionId}` });
            return;
        }

        try {
            const characterId = roomManager.getCharacterBySocketId(socket.id, sessionId);
            const session = roomManager.disconnectCharacterFromMember(socket.id, sessionId);
            if (session) {
                io.to(sessionId).emit('session:update', {
                    room: session.toJSON()
                });
            }

            const characterName = characterId
                ? await getCharacterName(characterId)
                : null;

            const sessionName = await getSessionName(sessionId);
            fastify.log.info({
                socketId: socket.id,
                sessionId: sessionId,
                characterId: characterId,
            }, `User unpick character ${characterName ? `(${characterName})` : 'unknown character'} in session (${sessionName})`);
        } catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    // socket.on('session:changeMove', async (sessionId, { moveValue }) => {
    //     const session = roomManager.get(sessionId);
    //     if (!session) {
    //         socket.emit('error', { message: `Session with id ${sessionId} not found` });
    //         return;
    //     }

    //     if (!session.hasMember(socket.id)) {
    //         socket.emit('error', { message: `User with id ${socket.id} is not in session ${sessionId}` });
    //         return;
    //     }

    //     let sessionName = null;

    //     try {
    //         sessionName = await getSessionName(sessionId);
    //     } catch (error) {
    //         socketErrorHandler(socket, error);
    //         return;
    //     }

    //     if (session.get(socket.id).role !== 'admin') {
    //         socket.emit('error', { message: `User with id ${socket.id} is not admin in session ${sessionId} (${sessionName})` });
    //         return;
    //     }

    //     try {
    //         const newMove = await updateSessionMove(sessionId, moveValue);
    //         io.to(sessionId).emit('session:update', { move: newMove });

    //         fastify.log.info({
    //             socketId: socket.id,
    //             sessionId: sessionId,
    //         }, `Admin change move to ${newMove} in session (${sessionName})`);
    //     } catch (error) {
    //         socketErrorHandler(socket, error);
    //     }
    // });

    socket.on('session:updateEverywhere', async (sessionId) => {
        try {
            const session = await getSession(sessionId)

            io.to(session.id).emit('session:updateEverywhere', session)
        }
        catch (error) {
            socketErrorHandler(socket, error);
        }
    })

    socket.on('session:updateAdmin', async (sessionId) => {
        try {
            const session = await getSession(sessionId)
            const room = roomManager.get(character.session.toString())

            if (room) {

                room.members.forEach((value, key) => {
                    if (value.role === 'admin') {
                        io.to(key).emit('session:updateAdmin', session)
                    }
                })
            }
        }
        catch (error) {
            socketErrorHandler(socket, error);
        }
    })

    socket.on('session:updateSession', async (sessionData) => {
        try {
            const session = await updateSession(sessionData)
            socket.emit('session:updateSession', session)
        }
        catch (error) {
            socketErrorHandler(socket, error);
        }
    })

    socket.on('session:get', async (sessionId) => {
        try {
            const session = await getSession(sessionId)
            socket.emit('session:get', session)
        }
        catch (error) {
            socketErrorHandler(socket, error);
        }
    })
};

export default registerSessionHandler;
