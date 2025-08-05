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

// MARK: - Room Lobby (placeholder for now)
struct RoomLobbyView: View {
    @ObservedObject var gameState: MultiplayerGameState
    
    var body: some View {
        VStack {
            Text("Room: \(gameState.roomCode)")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("Players: \(gameState.gameRoom?.players.count ?? 0)/\(gameState.gameRoom?.maxPlayers ?? 8)")
                .font(.headline)
            
            // Will expand this in Step 3
            Text("Waiting for players...")
                .padding()
        }
    }
}

// MARK: - Multiplayer Game View (placeholder for now)
struct MultiplayerGameView: View {
    @ObservedObject var gameState: MultiplayerGameState
    
    var body: some View {
        Text("Multiplayer Game Starting...")
        // Will implement in Step 4
    }
}
