import Room from './room.entity.js';

class RoomManager {
    constructor() {
        this.rooms = new Map();
    }

    get(roomId) {
        return this.rooms.get(roomId);
    }

    getOrCreate(roomId) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Room(roomId));
        }
        return this.rooms.get(roomId);
    }

    join(socketId, roomId) {
        const room = this.getOrCreate(roomId);
        room.addMember(socketId);
        return room;
    }

    leave(socketId, roomId) {
        const room = this.get(roomId);
        if (room) {
            room.removeMember(socketId);
            if (room.size === 0) this.rooms.delete(roomId);

            return room;
        }

        return null;
    }

    leaveAll(socketId) {
        const roomIds = [];

        this.rooms.forEach((room) => {
            const roomId = room.removeMember(socketId);
            if (roomId) {
                roomIds.push(roomId);
            }
        });

        return roomIds;
    }

    getRooms() {
        return Array.from(this.rooms.values()).map(room => room.toJSON());
    }
}

export const roomManager = new RoomManager();
