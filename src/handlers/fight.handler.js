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

    // A specific fightId (admin only - the GM live view at
    // /admin/:sessionId/fight/:fightId/live) pins the join to that exact
    // fight regardless of which one is flagged active, so board edits always
    // target the fight the admin actually opened. Players never pass one -
    // they always see the session's current active fight.
    socket.on('fight:join', async ({ sessionId, fightId } = {}) => {
        try {
            const { member } = getMember(sessionId);
            if (!member) throw new AuthError('Not a member of this session');

            let fight = (fightId && member.role === 'admin')
                ? await fightService.getFight(fightId)
                : await fightService.getActiveFight(sessionId);

            // Gated on whether a character is actually connected to this
            // socket, not on session role - an admin previewing/acting
            // through a player-bound route (character still gets connected
            // via session:connectCharacter there) should still get tracked
            // as a participant. Role only governs what gets filtered out of
            // the response below, not whether this socket is "playing" one.
            if (fight && member.userId) {
                fight = await fightService.ensureParticipant(fight.id, member.userId);
            }

            socket.emit('fight:join', fight ? (member.role === 'admin' ? fight : toPlayerFight(fight)) : null);
        } catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    // Admin can freely reposition anything (enemies or any character) - a
    // player can only reposition their own connected character token, never
    // an enemy or someone else's.
    socket.on('fight:move', async ({ sessionId, fightId, targetType, targetId, tileId }) => {
        try {
            const { room, member } = getMember(sessionId);
            if (!member) throw new AuthError('Not a member of this session');

            const isAdmin = member.role === 'admin';
            const isOwnCharacter = targetType === 'character' && member.userId === targetId;

            if (!isAdmin && !isOwnCharacter) throw new AuthError('Not authorized to move this token');

            const fight = await fightService.moveToken({ fightId, targetType, targetId, tileId });
            broadcastFight(room, fight);

            logAction(socket, {
                event: 'fight:move',
                sessionId,
                characterId: targetType === 'character' ? targetId : null,
                role: member.role,
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
