import { socketErrorHandler } from '../config/socketErrorHandler.js';
import { getCharacter, updateCharacter } from '../service/character.service.js';
import fastifyInstance from '../core/fastify.instance.js';
import { roomManager } from '../core/rooms/room.manager.js';
import { applyEffects } from '../utils/characterHelper.js';
import { sortByTwoFields, sortPerksByTwoFields } from '../utils/filtration.js';

const registerCharacterHandler = (io, socket) => {
    const fastify = fastifyInstance.server;

    socket.on('character:updateData', async (characterData) => {
        try {
            const character = await updateCharacter(characterData)

            sortFields(character)
            applyEffects(character)

            const room = roomManager.get(character.session.toString())

            if (room) {

                room.members.forEach((value, key) => {
                    if (value.userId === character.id) {
                        io.to(key).emit('character:updateNotify', character)
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

    socket.on('character:updateNotify', async (characterId) => {
        try {
            const character = await getCharacter(characterId)

            sortFields(character)
            applyEffects(character)

            const room = roomManager.get(character.session.toString())

            if (room) {

                room.members.forEach((value, key) => {
                    if (value.userId === character.id) {
                        io.to(key).emit('character:updateNotify', character)
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

    socket.on('character:get', async (characterId) => {
        try {
            const character = await getCharacter(characterId)

            sortFields(character)
            applyEffects(character)

            socket.emit('character:get', character)
        }
        catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    function sortFields(character) {
        sortPerksByTwoFields(character.perks, 'type', 'name')
        sortByTwoFields(character.entities, 'type', 'name')
    }
}

export default registerCharacterHandler;