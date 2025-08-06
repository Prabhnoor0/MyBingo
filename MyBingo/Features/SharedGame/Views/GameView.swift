//
//  GameView.swift
//  MyBingo
//
//  Created by Prabhnoor Kaur on 04/08/25.
//

import SwiftUI

struct GameView: View {
    @ObservedObject var gameModeManager: GameModeManager
    @State private var showAlert = false
    @State private var showEndGameAlert = false
    
    var body: some View {
        VStack(spacing: 0) {
            GameHeader(gameModeManager: gameModeManager)
            
            Spacer(minLength: 10)
            
            if gameModeManager.selectedMode == .singlePlayerAI {
                AIGameContent(gameState: gameModeManager.aiGameState)
            } else if gameModeManager.selectedMode == .multiplayer {
                MultiplayerLobbyView(gameState: gameModeManager.multiplayerGameState)
            }
            
            Spacer(minLength: 10)
            
            // Only show ActionBar for single player
            if gameModeManager.selectedMode == .singlePlayerAI {
                ActionBar(
                    gameState: gameModeManager.aiGameState,
                    onNewGame: {
                        gameModeManager.startGame(mode: gameModeManager.selectedMode)
                    },
                    onEndGame: {
                        showEndGameAlert = true
                    }
                )
            }
        }
        .alert(gameModeManager.aiGameState.gameWinner ?? "", isPresented: $showAlert) {
            Button("OK", role: .cancel) { }
        }
        .alert("End Game?", isPresented: $showEndGameAlert) {
            Button("Cancel", role: .cancel) { }
            Button("End Game", role: .destructive) {
                gameModeManager.aiGameState.endGame()
            }
        } message: {
            Text("Are you sure you want to end the current game?")
        }
        .onChange(of: gameModeManager.aiGameState.gameWinner) { oldValue, newValue in
            showAlert = newValue != nil
        }
    }
}
