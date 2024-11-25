let connection = null;

async function startConnection(hubUrl) {
    connection = new signalR.HubConnectionBuilder().withUrl(hubUrl).build();

    connection.on("PlayerJoined", (player, players) => {
        DotNet.invokeMethodAsync("OnTheRun", "OnPlayerJoined", player, players);
    });
    connection.on("PlayerUpdated", (player, update) => {
        DotNet.invokeMethodAsync("OnTheRun", "OnPlayerUpdated", player, update);
    });
    connection.on("InitialiseGameState", (players, chaser) => {
        DotNet.invokeMethodAsync("OnTheRun", "OnInitialiseGameState", players, chaser);
    });

    try {
        await connection.start();
        console.log("SignalR connected");
    } catch (err) {
        console.error("SignalR connection failed: ", err);
        setTimeout(() => startConnection(hubUrl), 5000);
    }

    //return connection;
}

async function invokeHubMethod(methodName, ...args) {
    if (connection) {
        try {
            await connection.invoke(methodName, ...args); // Call the SignalR hub method
        } catch (err) {
            console.error(`Error invoking hub method ${methodName}:`, err);
        }
    } else {
        console.error("SignalR connection not established.");
    }
}

