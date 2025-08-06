//
//  MultiplayerLobbyView.swift
//  MyBingo
//
//  Created by Prabhnoor Kaur on 05/08/25.
//


import SwiftUI

struct MultiplayerLobbyView: View {
    @ObservedObject var gameState: MultiplayerGameState
    
    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                Text("Multiplayer Bingo")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .padding(.top, 20)
                
                // Connection Status
                StatusView(status: gameState.connectionStatus)
                
                if gameState.connectionStatus == .disconnected {
                    // Main Menu
                    MainMenuView(gameState: gameState)
                } else if gameState.connectionStatus == .inRoom {
                    // Room Lobby
                    RoomLobbyView(gameState: gameState)
                } else if gameState.connectionStatus == .playing {
                    // Game View
                    MultiplayerGameView(gameState: gameState)
                }
                
                Spacer()
                
                // Error Message
                if let error = gameState.errorMessage {
                    Text(error)
                        .foregroundColor(.red)
                        .padding()
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(8)
                        .padding(.horizontal)
                }
            }
            .sheet(isPresented: $gameState.showingRoomCreation) {
                CreateRoomView(gameState: gameState)
            }
            .sheet(isPresented: $gameState.showingRoomJoining) {
                JoinRoomView(gameState: gameState)
            }
        }
    }
}

// MARK: - Status View
struct StatusView: View {
    let status: MultiplayerGameState.ConnectionStatus
    
    var body: some View {
        HStack {
            Circle()
                .fill(statusColor)
                .frame(width: 12, height: 12)
            
            Text(statusText)
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
    }
    
    private var statusColor: Color {
        switch status {
        case .disconnected: return .red
        case .connecting: return .orange
        case .connected, .inRoom: return .green
        case .playing: return .blue
        }
    }
    
    private var statusText: String {
        switch status {
        case .disconnected: return "Disconnected"
        case .connecting: return "Connecting..."
        case .connected: return "Connected"
        case .inRoom: return "In Room"
        case .playing: return "Playing"
        }
    }
}

// MARK: - Main Menu
struct MainMenuView: View {
    @ObservedObject var gameState: MultiplayerGameState
    
    var body: some View {
        VStack(spacing: 20) {
            Button("Create Room") {
                gameState.showingRoomCreation = true
            }
            .font(.title2)
            .foregroundStyle(.white)
            .frame(width: 200, height: 55)
            .background(Color.blue)
            .clipShape(RoundedRectangle(cornerRadius: 10))
            
            Button("Join Room") {
                gameState.showingRoomJoining = true
            }
            .font(.title2)
            .foregroundStyle(.white)
            .frame(width: 200, height: 55)
            .background(Color.green)
            .clipShape(RoundedRectangle(cornerRadius: 10))
        }
    }
}

// MARK: - Create Room Sheet
struct CreateRoomView: View {
    @ObservedObject var gameState: MultiplayerGameState
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("Create New Room")
                    .font(.title)
                    .fontWeight(.bold)
                    .padding(.top, 20)
                
                TextField("Your Name", text: $gameState.playerName)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding(.horizontal)
                
                Button("Create Room") {
                    gameState.createRoom()
                    dismiss()
                }
                .font(.title2)
                .foregroundStyle(.white)
                .frame(width: 170, height: 55)
                .background(gameState.playerName.isEmpty ? Color.gray : Color.blue)
                .clipShape(RoundedRectangle(cornerRadius: 10))
                .disabled(gameState.playerName.isEmpty || gameState.isLoading)
                
                if gameState.isLoading {
                    ProgressView("Creating room...")
                        .padding()
                }
                
                Spacer()
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }
}

// MARK: - Join Room Sheet
struct JoinRoomView: View {
    @ObservedObject var gameState: MultiplayerGameState
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("Join Room")
                    .font(.title)
                    .fontWeight(.bold)
                    .padding(.top, 20)
                
                TextField("Your Name", text: $gameState.playerName)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding(.horizontal)
                
                TextField("Room Code", text: $gameState.roomCode)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding(.horizontal)
                
                Button("Join Room") {
                    gameState.joinRoom()
                    dismiss()
                }
                .font(.title2)
                .foregroundStyle(.white)
                .frame(width: 170, height: 55)
                .background(canJoin ? Color.green : Color.gray)
                .clipShape(RoundedRectangle(cornerRadius: 10))
                .disabled(!canJoin || gameState.isLoading)
                
                if gameState.isLoading {
                    ProgressView("Joining room...")
                        .padding()
                }
                
                Spacer()
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }
    
    private var canJoin: Bool {
        !gameState.playerName.isEmpty && !gameState.roomCode.isEmpty
    }
}

// MARK: - Room Lobby
struct RoomLobbyView: View {
    @ObservedObject var gameState: MultiplayerGameState
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Room Header
                VStack(spacing: 10) {
                    Text("Room Code")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    
                    HStack {
                        Text(gameState.roomCode)
                            .font(.title)
                            .fontWeight(.bold)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 10)
                            .background(Color.blue.opacity(0.1))
                            .cornerRadius(10)
                        
                        Button(action: {
                            UIPasteboard.general.string = gameState.roomCode
                        }) {
                            Image(systemName: "doc.on.doc")
                                .foregroundColor(.blue)
                        }
                    }
                    
                    Text("Share this code with friends!")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.top)
                
                // Game Status
                VStack(spacing: 8) {
                    HStack {
                        Text("Players")
                        Spacer()
                        Text("\(gameState.gameRoom?.players.count ?? 0)/\(gameState.gameRoom?.maxPlayers ?? 8)")
                    }
                    .font(.headline)
                    
                    Text("Game Status: \(gameState.gameRoom?.gameState.rawValue.capitalized ?? "Unknown")")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding(.horizontal, 20)
                
                // Players List
                PlayerListView(gameState: gameState)
                
                Spacer()
                
                // Action Buttons
                VStack(spacing: 15) {
                    if isHost {
                        // Host Controls
                        Button(canStartGame ? "Start Game" : "Waiting for players...") {
                            gameState.startMultiplayerGame()
                        }
                        .font(.title2)
                        .foregroundStyle(.white)
                        .frame(width: 200, height: 55)
                        .background(canStartGame ? Color.green : Color.gray)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                        .disabled(!canStartGame)
                    } else {
                        // Player Ready Button
                        Button(isCurrentPlayerReady ? "Ready ✓" : "Mark as Ready") {
                            gameState.toggleReady()
                        }
                        .font(.title2)
                        .foregroundStyle(.white)
                        .frame(width: 200, height: 55)
                        .background(isCurrentPlayerReady ? Color.green : Color.blue)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                    }
                    
                    // Leave Room Button
                    Button("Leave Room") {
                        gameState.leaveRoom()
                    }
                    .font(.title2)
                    .foregroundStyle(.white)
                    .frame(width: 200, height: 55)
                    .background(Color.red)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .padding(.bottom, 30)
            }
        }
    }
    
    private var isHost: Bool {
        gameState.currentUser?.id == gameState.gameRoom?.hostId
    }
    
    private var canStartGame: Bool {
        guard let room = gameState.gameRoom else { return false }
        return room.canStartGame && isHost
    }
    
    private var isCurrentPlayerReady: Bool {
        guard let userId = gameState.currentUser?.id,
              let room = gameState.gameRoom else { return false }
        return room.players[userId]?.isReady ?? false
    }
}

// MARK: - Player List View
struct PlayerListView: View {
    @ObservedObject var gameState: MultiplayerGameState
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Players in Room")
                .font(.headline)
                .padding(.horizontal, 20)
            
            LazyVStack(spacing: 8) {
                if let players = gameState.gameRoom?.players.values.sorted(by: { $0.joinedAt < $1.joinedAt }) {
                    ForEach(Array(players), id: \.id) { player in
                        PlayerRowView(
                            player: player,
                            isHost: player.id == gameState.gameRoom?.hostId,
                            isCurrentUser: player.id == gameState.currentUser?.id
                        )
                    }
                } else {
                    Text("No players found")
                        .foregroundColor(.secondary)
                        .padding()
                }
            }
            .padding(.horizontal, 20)
        }
    }
}

// MARK: - Player Row View
struct PlayerRowView: View {
    let player: Player
    let isHost: Bool
    let isCurrentUser: Bool
    
    var body: some View {
        HStack {
            // Player Avatar/Initial
            ZStack {
                Circle()
                    .fill(isCurrentUser ? Color.blue : Color.gray.opacity(0.3))
                    .frame(width: 40, height: 40)
                
                Text(String(player.name.prefix(1).uppercased()))
                    .font(.headline)
                    .foregroundColor(isCurrentUser ? .white : .primary)
            }
            
            // Player Info
            VStack(alignment: .leading, spacing: 2) {
                HStack {
                    Text(player.name)
                        .font(.headline)
                        .foregroundColor(isCurrentUser ? .blue : .primary)
                    
                    if isCurrentUser {
                        Text("(You)")
                            .font(.caption)
                            .foregroundColor(.blue)
                    }
                    
                    if isHost {
                        Image(systemName: "crown.fill")
                            .foregroundColor(.orange)
                            .font(.caption)
                    }
                }
                
                Text("Joined \(timeAgo(from: player.joinedAt))")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            // Ready Status
            HStack {
                if player.isReady {
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                        Text("Ready")
                            .font(.caption)
                            .foregroundColor(.green)
                    }
                } else {
                    HStack {
                        Image(systemName: "clock.circle.fill")
                            .foregroundColor(.orange)
                        Text("Not Ready")
                            .font(.caption)
                            .foregroundColor(.orange)
                    }
                }
            }
        }
        .padding(.horizontal, 15)
        .padding(.vertical, 10)
        .background(Color.gray.opacity(0.1))
        .cornerRadius(10)
    }
    
    private func timeAgo(from date: Date) -> String {
        let interval = Date().timeIntervalSince(date)
        if interval < 60 {
            return "just now"
        } else if interval < 3600 {
            let minutes = Int(interval / 60)
            return "\(minutes)m ago"
        } else {
            let hours = Int(interval / 3600)
            return "\(hours)h ago"
        }
    }
}

// MARK: - Multiplayer Game View (Updated with Player Clicks)
struct MultiplayerGameView: View {
    @ObservedObject var gameState: MultiplayerGameState
    @State private var showWinnerAlert = false
    
    var body: some View {
        VStack(spacing: 15) {
            // Game Header Info
            MultiplayerGameHeader(gameState: gameState)
            
            // Current Number Display
            CurrentNumberDisplay(gameState: gameState)
            
            // Player's BINGO Board - NOW CLICKABLE
            if let currentUser = gameState.currentUser {
                BingoBoard(
                    title: "Your Board",
                    boardNumbers: currentUser.boardNumbers,
                    markedNumbers: Set(gameState.playerMarkedNumbers),
                    completedLines: currentUser.completedLines,
                    isDisabled: gameState.gameRoom?.gameState != .playing || gameState.gameRoom?.currentNumber == nil
                ) { number in
                    // Players click numbers that match the called number
                    gameState.playerClickedNumber(number)
                }
            }
            
            // Game Controls
            MultiplayerGameControls(gameState: gameState)
            
            Spacer()
        }
        .alert("Game Over!", isPresented: $showWinnerAlert) {
            Button("Back to Lobby") {
                gameState.endGame()
            }
        } message: {
            Text(gameState.gameRoom?.gameWinner != nil ? "Winner: \(gameState.gameRoom?.players[gameState.gameRoom?.gameWinner ?? ""]?.name ?? "Unknown")" : "Game finished")
        }
        .onChange(of: gameState.gameRoom?.gameWinner) { oldValue, newValue in
            showWinnerAlert = newValue != nil
        }
    }
}

// MARK: - Multiplayer Game Header
struct MultiplayerGameHeader: View {
    @ObservedObject var gameState: MultiplayerGameState
    
    var body: some View {
        VStack(spacing: 8) {
            Text("Multiplayer BINGO")
                .font(.title2)
                .fontWeight(.bold)
            
            HStack {
                Text("Room: \(gameState.roomCode)")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                Text("Players: \(gameState.gameRoom?.players.count ?? 0)")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            .padding(.horizontal, 20)
        }
        .padding(.top)
    }
}

// MARK: - Current Number Display (Updated)
struct CurrentNumberDisplay: View {
    @ObservedObject var gameState: MultiplayerGameState
    
    var body: some View {
        VStack(spacing: 10) {
            if let currentNumber = gameState.gameRoom?.currentNumber {
                VStack {
                    Text("Find and Click This Number!")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    
                    Text("\(currentNumber)")
                        .font(.system(size: 48, weight: .bold))
                        .foregroundColor(.blue)
                        .padding(20)
                        .background(Circle().fill(Color.blue.opacity(0.1)))
                        .scaleEffect(gameState.shouldHighlightCurrentNumber ? 1.2 : 1.0)
                        .animation(.easeInOut(duration: 0.5).repeatCount(3), value: gameState.shouldHighlightCurrentNumber)
                    
                    if gameState.hasPlayerMarkedCurrentNumber {
                        HStack {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                            Text("Found it! ✓")
                                .font(.subheadline)
                                .foregroundColor(.green)
                        }
                        .padding(.top, 5)
                    }
                }
            } else if gameState.gameRoom?.gameState == .playing {
                Text("Waiting for host to call a number...")
                    .font(.headline)
                    .foregroundColor(.orange)
                    .padding()
            }
            
            // Called Numbers History
            if let calledNumbers = gameState.gameRoom?.calledNumbers, !calledNumbers.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        Text("Called:")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        ForEach(calledNumbers.suffix(10), id: \.self) { number in
                            Text("\(number)")
                                .font(.caption)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.gray.opacity(0.2))
                                .cornerRadius(8)
                        }
                    }
                    .padding(.horizontal)
                }
            }
        }
        .padding()
        .background(Color.gray.opacity(0.05))
        .cornerRadius(15)
        .padding(.horizontal)
    }
}

// MARK: - Multiplayer Game Controls (Updated)
struct MultiplayerGameControls: View {
    @ObservedObject var gameState: MultiplayerGameState
    
    var body: some View {
        VStack(spacing: 15) {
            if isHost && gameState.gameRoom?.gameState == .playing {
                // Host can call numbers
                Button(gameState.gameRoom?.currentNumber == nil ? "Call First Number" : "Call Next Number") {
                    gameState.callNextNumber()
                }
                .font(.title2)
                .foregroundStyle(.white)
                .frame(width: 220, height: 55)
                .background(Color.blue)
                .clipShape(RoundedRectangle(cornerRadius: 10))
                .disabled(gameState.isLoading)
                
                if gameState.isLoading {
                    ProgressView("Calling number...")
                        .padding()
                }
            }
            
            // BINGO Button - players can claim win
            if canClaimBingo {
                Button("BINGO! 🎉") {
                    gameState.claimBingo()
                }
                .font(.title)
                .foregroundStyle(.white)
                .frame(width: 200, height: 60)
                .background(Color.green)
                .clipShape(RoundedRectangle(cornerRadius: 15))
                .scaleEffect(1.1)
                .animation(.easeInOut(duration: 0.5).repeatForever(autoreverses: true), value: canClaimBingo)
            }
            
            // Leave Game Button
            Button("Leave Game") {
                gameState.leaveRoom()
            }
            .font(.subheadline)
            .foregroundColor(.red)
        }
        .padding()
    }
    
    private var isHost: Bool {
        gameState.currentUser?.id == gameState.gameRoom?.hostId
    }
    
    private var canClaimBingo: Bool {
        guard let currentUser = gameState.currentUser else { return false }
        return currentUser.completedLines.count >= 5 && !currentUser.hasWon
    }
}
