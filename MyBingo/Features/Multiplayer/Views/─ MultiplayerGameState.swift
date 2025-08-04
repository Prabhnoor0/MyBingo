//
//  ─ MultiplayerGameState.swift
//  MyBingo
//
//  Created by Prabhnoor Kaur on 04/08/25.
//

import SwiftUI
import Combine

class MultiplayerGameState: ObservableObject {
    @Published var playerBoard: [Int] = []
    @Published var markedNumbers: Set<Int> = []
    @Published var players: [Player] = []
    @Published var currentPlayerIndex: Int = 0
    @Published var gameEnded = false
    @Published var winner: String? = nil
    @Published var isConnected = false
    @Published var gameId: String? = nil
    
    func startNewGame() {
        playerBoard = Array(1...25).shuffled()
        markedNumbers.removeAll()
        gameEnded = false
        winner = nil
        // Firebase connection will be added in Step 2
    }
    
    func markNumber(_ number: Int) {
        // Multiplayer logic will be added in Step 2
        guard !gameEnded else { return }
        markedNumbers.insert(number)
    }
    
    func endGame() {
        gameEnded = true
        // Disconnect from Firebase
    }
}
