//
//  AiGameContent.swift
//  MyBingo
//
//  Created by Prabhnoor Kaur on 05/08/25.
//
import SwiftUI

struct AIGameContent: View {
    @ObservedObject var gameState: AIGameState
    @State private var showAlert = false
    @State private var showGameEndView = false
    
    var body: some View {
        if showGameEndView {
            GameEndView(gameState: gameState) {
                showGameEndView = false
                gameState.startNewGame()
            }
        } else {
            gamePlayView
        }
    }
    
    private var gamePlayView: some View {
        VStack {
            // Game status messages
            VStack(spacing: 8) {
                if let playerChoice = gameState.lastPlayerChoice {
                    Text("You chose: \(playerChoice)")
                        .font(.title2)
                        .fontWeight(.semibold)
                        .foregroundColor(.blue)
                }
                
                if let aiChoice = gameState.aiHasChosenNumber {
                    Text("AI chose: \(aiChoice)")
                        .font(.title2)
                        .fontWeight(.semibold)
                        .foregroundColor(.red)
                } else if !gameState.isPlayerTurn && !gameState.gameEnded {
                    Text("AI is thinking...")
                        .font(.title2)
                        .fontWeight(.semibold)
                        .foregroundColor(.orange)
                }
                
                if gameState.isPlayerTurn && !gameState.gameEnded {
                    Text("Your turn!")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.green)
                }
            }
            .frame(height: 80)
            .padding(.bottom, 20)
            
            // Player's board
            BingoBoard(
                title: "Your Board",
                boardNumbers: gameState.playerBoardNumbers,
                markedNumbers: gameState.markedNumbers,
                completedLines: gameState.playerCompletedLines,
                isDisabled: !gameState.isPlayerTurn || gameState.gameEnded
            ) { number in
                gameState.playerClickedNumber(number)
            }
        }
        .alert(gameState.gameWinner ?? "", isPresented: $showAlert) {
            Button("See Results") {
                showAlert = false
                showGameEndView = true
            }
            Button("New Game") {
                showAlert = false
                gameState.startNewGame()
            }
        }
        .onChange(of: gameState.gameWinner) { oldValue, newValue in
            if newValue != nil {
                showAlert = true
            }
        }
    }
}
