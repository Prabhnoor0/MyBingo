//
//  GameModeManager.swift
//  MyBingo
//
//  Created by Prabhnoor Kaur on 04/08/25.
//


import SwiftUI

class GameModeManager: ObservableObject {
    @Published var selectedMode: GameMode = .singlePlayerAI
    @Published var aiGameState = AIGameState()
    @Published var multiplayerGameState = MultiplayerGameState()
    
    enum GameMode: CaseIterable {
        case singlePlayerAI
        case multiplayer
        
        var displayName: String {
            switch self {
            case .singlePlayerAI: return "vs AI"
            case .multiplayer: return "Multiplayer"
            }
        }
    }
    
    func startGame(mode: GameMode) {
        selectedMode = mode
        if mode == .singlePlayerAI {
            aiGameState.startNewGame()
        } else if mode == .multiplayer {
            multiplayerGameState.startNewGame()
        }
    }
}
