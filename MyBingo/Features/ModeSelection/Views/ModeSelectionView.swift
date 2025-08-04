//
//  ModeSelectionView.swift
//  MyBingo
//
//  Created by Prabhnoor Kaur on 04/08/25.
//
import SwiftUI

struct ModeSelectionView: View {
    @StateObject private var gameModeManager = GameModeManager()
    
    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                Text("MyBingo")
                    .font(.system(.largeTitle, design: .rounded).weight(.black))
                    .kerning(3)
                    .italic()
                    .foregroundColor(.gray)
                    .padding(.top, 50)
                
                Text("Choose Game Mode")
                    .font(.title2)
                    .fontWeight(.semibold)
                    .padding(.bottom, 20)
                
                ForEach(GameMode.allCases, id: \.self) { mode in
                    GameModeButton(
                        mode: mode,
                        isSelected: gameModeManager.selectedMode == mode
                    ) {
                        gameModeManager.startGame(mode: mode)
                    }
                }
                
                Spacer()
            }
            .padding()
            .fullScreenCover(isPresented: $gameModeManager.isInGame) {
                GameView(gameModeManager: gameModeManager)
            }
        }
    }
}

struct GameModeButton: View {
    let mode: GameMode
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(mode.rawValue)
                        .font(.headline)
                        .fontWeight(.semibold)
                    Spacer()
                    Image(systemName: "chevron.right")
                        .foregroundColor(.gray)
                }
                
                Text(mode.description)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.leading)
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

