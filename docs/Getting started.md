# Getting Started Guide for New Developers

Welcome to the OnTheRun project! This document provides essential information to help you get started with the project and understand how critical parts of the system work.


## Project Overview
The project is a multiplayer game using **Blazor Server** and **SignalR** to handle real-time communication. Custom SignalR hubs and services extend functionality and maintain client-server interaction.


## Core Concepts

### 1. SignalR Integration
Blazor Server inherently uses SignalR for real-time updates. However, custom functionality is added through a custom SignalR hub (`GameHub`).

#### GameHub
- Manages player actions (e.g., joining, leaving, switching teams).
- Relies on `GameSessionManager` to manage game state and player data.

#### Why Services?
- Hub methods are not directly callable from server-side code.
- **`GameService`** uses `IHubContext` to:
  - Broadcast updates to clients.
  - Handle game state logic.

### 2. JavaScript SignalR Client
A custom SignalR client (`signalR.js`) manages connections and invokes hub methods from the client side:
- **`startConnection(hubUrl)`**: Establishes a connection with the hub and retries on failure.
- **`invokeHubMethod(methodName, ...args)`**: Dynamically calls hub methods.


## Key Files and Components

### `Program.cs`
- Sets up the application and services.
- Key services:
  - **`GameSessionManager`**: Tracks game sessions and player data.
  - **SignalR Hub (`GameHub`)**: Handles real-time game communication.

### `GameHub.cs`
A custom SignalR hub that:
- Adds/removes players from game groups.
- Broadcasts events (e.g., `PlayerJoined`, `PlayerLeft`) to all group members.
- Ensures thread safety using locks for shared data operations.

### `GameService.cs`
Provides server-side functions for:
- Starting a game.
- Switching teams.
- Broadcasting updates using `IHubContext`.

### `App.Razor`
- Defines the application layout.
- Includes necessary libraries and SignalR scripts:
  - **SignalR library** and **custom `signalR.js` script** are included for client communication.
  - Blazor components rendered in **InteractiveServer** mode for real-time updates.

### `Home.Razor`
Uses the `invokeHubMethod` JavaScript function to call `GameHub` methods (e.g., `JoinGame`).


## How It Works

### Client-Server Workflow

1. **Client Connects**:
   - `signalR.js` establishes a SignalR connection with `GameHub`.
   - Methods like `startConnection` ensure resilience to connection drops.

2. **Client Action**:
   - Example: `JoinGame` method is invoked via `invokeHubMethod` in JavaScript.

3. **Server Processing**:
   - `GameHub` validates the game session and player data.
   - Adds player to a group and broadcasts `PlayerJoined` to all group members.

4. **Client Updates**:
   - Clients listen for updates (e.g., `PlayerJoined`) and update their UI.


## Getting Started Steps

1. **Setup Environment**:
   - Install required tools: `.NET SDK`, Visual Studio Code/Visual Studio.
   - Clone the repository and restore dependencies.

2. **Run the Application**:
   - Use `dotnet run` to start the server.
   - Access the application at `https://localhost:5001`.

3. **Understand the Flow**:
   - Review `Program.cs` for application setup.
   - Explore `GameHub.cs` and `GameService.cs` for game logic.
   - Check `signalR.js` and `Home.Razor` for client interactions.

4. **Debugging Tips**:
   - Use browser developer tools to monitor SignalR connections.
   - Check console logs for SignalR errors or connection issues.


## Development Notes

- **Thread Safety**: Always lock shared resources (e.g., `gameSession`) to prevent race conditions.
- **Error Handling**: Use `HubException` for custom error messages in `GameHub`.
- **Custom SignalR Features**: Extend functionality via services (e.g. `GameService.cs`) to keep hub logic lightweight and modular.
