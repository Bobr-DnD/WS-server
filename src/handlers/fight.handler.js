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

    // Participants/positions/AP are the same for everyone looking at the map -
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

    socket.on('fight:move', async ({ sessionId, fightId, targetType, targetId, tileId }) => {
        try {
            const { room, member } = getMember(sessionId);
            if (!member) throw new AuthError('Not a member of this session');

            const isAdmin = member.role === 'admin';
            if (targetType === 'character' && !isAdmin && member.userId !== targetId) {
                throw new AuthError('Can only move your own character');
            }

            const fight = await fightService.moveToken({ fightId, targetType, targetId, tileId, isAdmin });
            broadcastFight(room, fight);

            logAction(socket, {
                event: 'fight:move',
                sessionId,
                characterId: member.userId ?? null,
                message: targetType === 'enemy' ? 'Ворога переміщено на карті' : 'Персонажа переміщено на карті'
            });
        } catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    socket.on('fight:setActiveLoadout', async ({ sessionId, fightId, loadoutId }) => {
        try {
            const { room, member } = getMember(sessionId);
            if (!member?.userId) throw new AuthError('No character connected');

            const fight = await fightService.setActiveLoadout({ fightId, characterId: member.userId, loadoutId });
            broadcastFight(room, fight);
        } catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    socket.on('fight:setActiveWeapon', async ({ sessionId, fightId, entityId }) => {
        try {
            const { room, member } = getMember(sessionId);
            if (!member?.userId) throw new AuthError('No character connected');

            const fight = await fightService.setActiveWeapon({ fightId, characterId: member.userId, entityId });
            broadcastFight(room, fight);
        } catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    socket.on('fight:readyAttack', async ({ sessionId, fightId, targetEnemy, targetHealthId, rollMode, dice, modifier, manualTotal }) => {
        try {
            const { room, member } = getMember(sessionId);
            if (!member?.userId) throw new AuthError('No character connected');

            const { fight, rolled, total, cost } = await fightService.readyAttack({
                fightId,
                characterId: member.userId,
                targetEnemy,
                targetHealthId,
                rollMode,
                dice,
                modifier,
                manualTotal
            });

            broadcastFight(room, fight);

            const rollText = rollMode === 'manual'
                ? `заявив результат ${total}`
                : `кинув ${rolled.map(r => `${r.count}${r.die}`).join('+') || '0'}${modifier ? ` ${modifier > 0 ? '+' : ''}${modifier}` : ''} = ${total}`;

            logAction(socket, {
                event: 'fight:readyAttack',
                sessionId,
                characterId: member.userId,
                message: `Персонаж готує атаку (витрачено ${cost} ОД): ${rollText}`
            });
        } catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    socket.on('fight:cancelReady', async ({ sessionId, fightId }) => {
        try {
            const { room, member } = getMember(sessionId);
            if (!member?.userId) throw new AuthError('No character connected');

            const fight = await fightService.cancelReady({ fightId, characterId: member.userId });
            broadcastFight(room, fight);
        } catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    socket.on('fight:resolveAttack', async ({ sessionId, fightId, characterId, approve }) => {
        try {
            const { room, member } = getMember(sessionId);
            if (member?.role !== 'admin') throw new AuthError('Admin access required');

            const fight = await fightService.resolveAttack({ fightId, characterId, approve });
            broadcastFight(room, fight);

            logAction(socket, {
                event: 'fight:resolveAttack',
                sessionId,
                characterId,
                role: 'admin',
                message: approve ? 'Адмін підтвердив атаку' : 'Адмін відхилив атаку'
            });
        } catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    socket.on('fight:adminSetAP', async ({ sessionId, fightId, characterId, current, max }) => {
        try {
            const { room, member } = getMember(sessionId);
            if (member?.role !== 'admin') throw new AuthError('Admin access required');

            const fight = await fightService.adminSetAP({ fightId, characterId, current, max });
            broadcastFight(room, fight);
        } catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    socket.on('fight:newRound', async ({ sessionId, fightId }) => {
        try {
            const { room, member } = getMember(sessionId);
            if (member?.role !== 'admin') throw new AuthError('Admin access required');

            const fight = await fightService.newRound(fightId);
            broadcastFight(room, fight);

            logAction(socket, {
                event: 'fight:newRound',
                sessionId,
                role: 'admin',
                message: 'Новий раунд: дії відновлено'
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
