//
//  ModeSelectionView.swift
//  MyBingo
//
//  Created by Prabhnoor Kaur on 04/08/25.
//


import SwiftUI

struct ModeSelectionView: View {
    @StateObject private var gameModeManager = GameModeManager()
    @State private var showGameView = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 40) {
                Text("MyBingo")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                VStack(spacing: 20) {
                    // Single Player AI Button
                    Button("vs AI") {
                        gameModeManager.selectedMode = .singlePlayerAI
                        showGameView = true
                    }
                    .font(.title2)
                    .foregroundStyle(.white)
                    .frame(width: 200, height: 55)
                    .background(Color.blue)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    
                    // Multiplayer Button
                    Button("Multiplayer") {
                        gameModeManager.selectedMode = .multiplayer
                        showGameView = true
                    }
                    .font(.title2)
                    .foregroundStyle(.white)
                    .frame(width: 200, height: 55)
                    .background(Color.green)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
            }
        }
        .fullScreenCover(isPresented: $showGameView) {
            GameView(gameModeManager: gameModeManager)
        }
    }
}
