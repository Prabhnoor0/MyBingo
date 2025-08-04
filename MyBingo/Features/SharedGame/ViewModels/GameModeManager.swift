//
//  GameModeManager.swift
//  MyBingo
//
//  Created by Prabhnoor Kaur on 04/08/25.
//

import SwiftUI
import Combine

enum GameMode: String, CaseIterable {
    case singlePlayerAI = "Single Player vs AI"
    case multiplayer = "Multiplayer (7-8 Players)"
    
    var description: String {
        switch self {
        case .singlePlayerAI:
            return "Play against AI opponent"
        case .multiplayer:
            return "Play with 7-8 friends online"
        }
    }
}

class GameModeManager: ObservableObject {
    @Published var selectedMode: GameMode = .singlePlayerAI
    @Published var isInGame: Bool = false
    
    // Single Player AI Game State
    @Published var aiGameState = AIGameState()
    
    // Multiplayer Game State
    @Published var multiplayerGameState = MultiplayerGameState()
    
    func startGame(mode: GameMode) {
        selectedMode = mode
        isInGame = true
        
        switch mode {
        case .singlePlayerAI:
            aiGameState.startNewGame()
        case .multiplayer:
            multiplayerGameState.startNewGame()
        }
    }
    
    func endGame() {
        isInGame = false
        aiGameState.endGame()
        multiplayerGameState.endGame()
    }
}
