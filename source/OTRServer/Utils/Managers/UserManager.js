class UserManager {
    constructor() {
        this.userSessions = new Map();
    }

    updateUserSession(userId, gameId, deviceId) {
        const sessionInfo = { gameId, deviceId };
        this.userSessions.set(userId, sessionInfo);
    }

    getUserSession(userId) {
        if (!this.userSessions.has(userId)) {
            throw new Error('User with this ID does not exist.');
        }
        return this.userSessions.get(userId);
    }

    removeUserSession(userId) {
        if (!this.userSessions.has(userId)) {
            throw new Error('User with this ID does not exist.');
        }
        this.userSessions.delete(userId);
    }

    getUsersByGameId(gameId) {
        const users = [];
        for (const [userId, sessionInfo] of this.userSessions.entries()) {
            if (sessionInfo.gameId === gameId) {
                users.push({ userId, deviceId: sessionInfo.deviceId });
            }
        }
        return users;
    }

    getUserByDeviceId(deviceId) {
        for (const [userId, sessionInfo] of this.userSessions.entries()) {
            if (sessionInfo.deviceId === sessionInfo.deviceId) {
                return ({ userId, gameId: sessionInfo.gameId });
            }
        }
    }
}
