import { socketErrorHandler } from '../config/socketErrorHandler.js';
import { getCharacter, updateCharacter } from '../service/character.service.js';
import fastifyInstance from '../core/fastify.instance.js';
import { roomManager } from '../core/rooms/room.manager.js';

const registerCharacterHandler = (io, socket) => {
    const fastify = fastifyInstance.server;

    socket.on('character:update', async (characterData) => {
        try {
            const character = await updateCharacter(characterData)
            const room = roomManager.get(character.session.toString())

            if (room) {
                console.log(room);

                room.members.forEach((value, key) => {
                    if (value.userId === character.id) {
                        io.to(key).emit('character:update', character)
                        console.log(key);
                    }

                    if (value.role === 'admin') {
                        io.to(key).emit('character:update', character)
                        console.log(key);
                    }

                })
            }
        }
        catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    socket.on('character:get', async (characterId) => {
        try {
            const character = await getCharacter(characterId)
            socket.emit('character:get', character)
        }
        catch (error) {
            socketErrorHandler(socket, error);
        }
    });
}

export default registerCharacterHandler;