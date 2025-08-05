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
            
            if gameModeManager.selectedMode == .singlePlayerAI {
                AIGameContent(gameState: gameModeManager.aiGameState)
            } else if gameModeManager.selectedMode == .multiplayer {
                Text("Multiplayer Mode - Coming Soon!")
                    .font(.title)
                    .padding()
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
