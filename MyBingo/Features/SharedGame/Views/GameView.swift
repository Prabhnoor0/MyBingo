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
    
    var body: some View {
        VStack(spacing: 0) {
            GameHeader(gameModeManager: gameModeManager)
            
            Spacer(minLength: 10)
            
            // Example with only AI game, switch as needed
            if gameModeManager.selectedMode == .singlePlayerAI {
                PlayerInfoPanel(
                    title: "You",
                    subtitle: gameModeManager.aiGameState.isPlayerTurn ? "Your turn" : "AI's turn"
                )
                GameBoard(
                    numbers: gameModeManager.aiGameState.playerBoardNumbers,
                    markedNumbers: gameModeManager.aiGameState.markedNumbers,
                    isDisabled: !gameModeManager.aiGameState.isPlayerTurn || gameModeManager.aiGameState.gameEnded
                ) { number in
                    gameModeManager.aiGameState.playerClickedNumber(number)
                }
                PlayerInfoPanel(
                    title: "AI",
                    subtitle: gameModeManager.aiGameState.isPlayerTurn ? "Waiting..." : "AI thinking"
                )
            } else if gameModeManager.selectedMode == .multiplayer {
                // Insert MultiplayerGameBoard, Player panels, etc.
            }
            
            Spacer(minLength: 10)
            
            ActionBar(
                onNewGame: {
                    gameModeManager.startGame(mode: gameModeManager.selectedMode)
                }
            )
        }
        .alert(gameModeManager.aiGameState.gameWinner ?? "", isPresented: $showAlert) {
            Button("OK", role: .cancel) { }
        }
        .onChange(of: gameModeManager.aiGameState.gameWinner) { winner in
            showAlert = winner != nil
        }
    }
}
