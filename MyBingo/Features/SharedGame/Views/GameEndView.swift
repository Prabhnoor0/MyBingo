//
//  GameEndView.swift
//  MyBingo
//
//  Created by Prabhnoor Kaur on 05/08/25.
//

import SwiftUI

struct GameEndView: View {
    let gameState: AIGameState
    let onNewGame: () -> Void
    
    var body: some View {
        ScrollView(.vertical, showsIndicators: true) {
            VStack(spacing: 30) {
                Text(gameState.gameWinner ?? "Game Over")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.center)
                    .padding(.top, 20)
                
                Text("Final Results")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                // Player's Board
                BingoBoard(
                    title: "Your Board",
                    boardNumbers: gameState.playerBoardNumbers,
                    markedNumbers: gameState.markedNumbers,
                    completedLines: gameState.playerCompletedLines,
                    isDisabled: true,
                    onNumberTapped: nil
                )
                .padding(.horizontal, 20)
                
                Divider()
                    .frame(height: 1)
                    .background(Color.gray)
                    .padding(.horizontal, 40)
                
                // AI's Board
                BingoBoard(
                    title: "AI's Board",
                    boardNumbers: gameState.aiBoardNumbers,
                    markedNumbers: gameState.markedNumbers,
                    completedLines: gameState.aiCompletedLines,
                    isDisabled: true,
                    onNumberTapped: nil
                )
                .padding(.horizontal, 20)
                
            }
            .padding(.horizontal, 10)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(UIColor.systemBackground))
        .edgesIgnoringSafeArea(.all)
    }
}
