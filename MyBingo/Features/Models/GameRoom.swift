//
//  GameRoom.swift
//  MyBingo
//
//  Created by Prabhnoor Kaur on 05/08/25.
//

import Foundation

struct GameRoom: Identifiable, Codable {
    let id: String
    var hostId: String
    var players: [String: Player] // Player ID -> Player
    var maxPlayers: Int
    var currentNumber: Int?
    var calledNumbers: [Int]
    var gameState: GameState
    var currentTurnPlayerId: String?
    var createdAt: Date
    var gameWinner: String?
    
    enum GameState: String, Codable, CaseIterable {
        case waiting = "waiting"
        case ready = "ready" 
        case playing = "playing"
        case finished = "finished"
    }
    
    init(hostId: String, maxPlayers: Int = 8) {
        self.id = UUID().uuidString
        self.hostId = hostId
        self.players = [:]
        self.maxPlayers = maxPlayers
        self.currentNumber = nil
        self.calledNumbers = []
        self.gameState = .waiting
        self.currentTurnPlayerId = nil
        self.createdAt = Date()
        self.gameWinner = nil
    }
    
    var isGameFull: Bool {
        return players.count >= maxPlayers
    }
    
    var canStartGame: Bool {
        return players.count >= 2 && players.values.allSatisfy { $0.isReady }
    }
}
