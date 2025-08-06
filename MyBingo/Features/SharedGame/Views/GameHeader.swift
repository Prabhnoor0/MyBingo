//
//  GameHeader.swift
//  MyBingo
//
//  Created by Prabhnoor Kaur on 05/08/25.
//

import SwiftUI

struct GameHeader: View {
    @ObservedObject var gameModeManager: GameModeManager

    var body: some View {
        HStack {
            Button(action: {
                // Call the correct endGame based on selected mode
                switch gameModeManager.selectedMode {
                case .singlePlayerAI:
                    gameModeManager.aiGameState.endGame()
                case .multiplayer:
                    gameModeManager.multiplayerGameState.endGame()
                }
            }) {
                Image(systemName: "arrow.backward")
                Text("Menu")
            }
            .font(.subheadline)
            .foregroundColor(.blue)

            Spacer()

            Text(gameModeManager.selectedMode.displayName) // Use displayName, not rawValue
                .font(.headline)
                .fontWeight(.bold)
        }
        .padding([.horizontal, .top])
    }
}
