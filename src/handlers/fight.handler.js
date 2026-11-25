import { socketErrorHandler } from '../config/socketErrorHandler.js';
import { roomManager } from '../core/rooms/room.manager.js';
import { toPlayerFight } from '../utils/fightFiltration.js';
import { logAction } from '../utils/wsLogger.js';
import { AuthError } from '../utils/errors.js';
import * as fightService from '../service/fight.service.js';

const registerFightHandler = (io, socket) => {

    function getMember(sessionId) {
        const room = roomManager.get(sessionId);
        return { room, member: room?.members.get(socket.id) };
    }

    // Participants/positions are the same for everyone looking at the map -
    // only enemy notes and not-yet-revealed enemies differ by role, so every
    // broadcast just picks the admin doc or the filtered player doc per recipient.
    function broadcastFight(room, fight) {
        if (!room || !fight) return;
        const playerPayload = toPlayerFight(fight);

        room.members.forEach((value, key) => {
            io.to(key).emit('fight:updateNotify', value.role === 'admin' ? fight : playerPayload);
        });
    }

    socket.on('fight:join', async (sessionId) => {
        try {
            const { member } = getMember(sessionId);
            if (!member) throw new AuthError('Not a member of this session');

            let fight = await fightService.getActiveFight(sessionId);

            if (fight && member.role !== 'admin' && member.userId) {
                fight = await fightService.ensureParticipant(fight.id, member.userId);
            }

            socket.emit('fight:join', fight ? (member.role === 'admin' ? fight : toPlayerFight(fight)) : null);
        } catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    // Admin-only - the map is a board the GM arranges, not something players
    // move their own token on.
    socket.on('fight:move', async ({ sessionId, fightId, targetType, targetId, tileId }) => {
        try {
            const { room, member } = getMember(sessionId);
            if (member?.role !== 'admin') throw new AuthError('Admin access required');

            const fight = await fightService.moveToken({ fightId, targetType, targetId, tileId });
            broadcastFight(room, fight);

            logAction(socket, {
                event: 'fight:move',
                sessionId,
                role: 'admin',
                message: targetType === 'enemy' ? 'Ворога переміщено на карті' : 'Персонажа переміщено на карті'
            });
        } catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    socket.on('fight:adminUpdate', async ({ sessionId, fightId, ops }) => {
        try {
            const { room, member } = getMember(sessionId);
            if (member?.role !== 'admin') throw new AuthError('Admin access required');

            const fight = await fightService.adminUpdateFight(fightId, ops);
            broadcastFight(room, fight);
        } catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    socket.on('fight:setActive', async ({ sessionId, fightId }) => {
        try {
            const { room, member } = getMember(sessionId);
            if (member?.role !== 'admin') throw new AuthError('Admin access required');

            const fight = await fightService.setActiveFight({ sessionId, fightId });
            io.to(sessionId).emit('fight:setActiveNotify', { id: fight.id, name: fight.name });
            broadcastFight(room, fight);
        } catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    socket.on('fight:deactivate', async ({ sessionId, fightId }) => {
        try {
            const { member } = getMember(sessionId);
            if (member?.role !== 'admin') throw new AuthError('Admin access required');

            await fightService.deactivateFight(fightId);
            io.to(sessionId).emit('fight:setActiveNotify', null);
        } catch (error) {
            socketErrorHandler(socket, error);
        }
    });
}

export default registerFightHandler;
