import { socketErrorHandler } from '../config/socketErrorHandler.js';
import { getCharacter, updateCharacter } from '../service/character.service.js';
import { getSession } from '../service/session.service.js';
import fastifyInstance from '../core/fastify.instance.js';
import { roomManager } from '../core/rooms/room.manager.js';

const registerCharacterHandler = (io, socket) => {
    const fastify = fastifyInstance.server;

    socket.on('character:updateData', async (characterData) => {
        try {
            const character = await updateCharacter(characterData)
            const session = await getSession(character.session)
            const room = roomManager.get(character.session.toString())
            
            if (room) {

                room.members.forEach((value, key) => {
                    if (value.userId === character.id) {
                        io.to(key).emit('character:updateDataNotify', character)
                    }

                    if (value.role === 'admin') {
                        io.to(key).emit('session:updateDataNotify', session)
                    }
                })
            }
        }
        catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    socket.on('character:updateDataNotify', async (characterId) => {
        try {
            const character = await getCharacter(characterId)

            const room = roomManager.get(character.session.toString())

            if (room) {

                room.members.forEach((value, key) => {
                    if (value.userId === character.id) {
                        io.to(key).emit('character:updateDataNotify', character)
                    }

                    if (value.role === 'admin') {
                        io.to(key).emit('character:updateNotify', character)
                    }
                })
            }
        }
        catch (error) {
            socketErrorHandler(socket, error);
        }
    });
}

export default registerCharacterHandler;