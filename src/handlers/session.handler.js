import { socketErrorHandler } from '../config/socketErrorHandler.js';
import { getSessionCharacters, updateSessionMove } from '../service/session.service.js';
import { roomManager } from '../core/rooms/room.manager.js';

const registerSessionHandler = (io, socket) => {
    socket.on('session:connectCharacter', async (sessionId, { characterId }) => {
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
            const characters = await getSessionCharacters(sessionId);
            const sessionCharacterIds = characters.map(String);
            if (sessionCharacterIds.includes(characterId)) {
                const session = roomManager.connectCharacterToMember(socket.id, sessionId, characterId);
                if (session) {
                    io.to(sessionId).emit('session:update', session.toJSON());
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
            const session = roomManager.disconnectCharacterFromMember(socket.id, sessionId);
            if (session) {
                io.to(sessionId).emit('session:update', session.toJSON());
            }
        } catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    socket.on('session:changeMove', async (sessionId, { moveValue }) => {
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
            const newMove = await updateSessionMove(sessionId, moveValue);
            io.to(sessionId).emit('session:update', { move: newMove });
        } catch (error) {
            socketErrorHandler(socket, error);
        }
    });
};

export default registerSessionHandler;
