import Room from './room.entity.js';
import fastifyInstance from '../fastify.instance.js';

class RoomManager {
    constructor() {
        this.rooms = new Map();
        this.pendingLeaves = new Map();
    }

    get(roomId) {
        return this.rooms.get(roomId);
    }

    getOrCreate(roomId) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Room(roomId));
            fastifyInstance.server.log.info(`Room with session has been created (roomId: ${roomId})`);
        }
        return this.rooms.get(roomId);
    }

    join(socketId, roomId, role) {
        const room = this.getOrCreate(roomId);
        room.addMember(socketId, role);
        return room;
    }

    leave(socketId, roomId) {
        const room = this.get(roomId);
        if (room) {
            room.removeMember(socketId);

            return room;
        }

        return null;
    }

    leaveAll(socketId) {
        const roomIds = [];

        this.rooms.forEach((r) => {
            const room = r.removeMember(socketId);
            if (room) {
                roomIds.push(room.id);
            }
        });

        return roomIds;
    }

    scheduleLeaveAll(socketId, delayMs, onLeave) {
        this.cancelScheduledLeave(socketId);

        const timer = setTimeout(() => {
            this.pendingLeaves.delete(socketId);
            const roomIds = this.leaveAll(socketId);
            onLeave(roomIds);
        }, delayMs);

        this.pendingLeaves.set(socketId, timer);
    }

    cancelScheduledLeave(socketId) {
        const timer = this.pendingLeaves.get(socketId);
        if (timer) {
            clearTimeout(timer);
            this.pendingLeaves.delete(socketId);
        }
    }

    connectCharacterToMember(socketId, roomId, userId) {
        const room = this.get(roomId);
        if (room) {
            return room.connectCharacterToMember(socketId, userId);
        }

        return null;
    }

    disconnectCharacterFromMember(socketId, roomId) {
        const room = this.get(roomId);
        if (room) {
            return room.disconnectCharacterFromMember(socketId);
        }

        return null;
    }

    getCharacterBySocketId(socketId, roomId) {
        const room = this.get(roomId);
        if (room) {
            return room.getCharacterBySocketId(socketId);
        }

        return null;
    }

    deleteRoom(roomId) {
        this.rooms.delete(roomId);
        fastifyInstance.server.log.info(`Room with session has been deleted (roomId: ${roomId})`);
    }

    getRooms() {
        return Array.from(this.rooms.values()).map(room => room.toJSON());
    }
}

export const roomManager = new RoomManager();
