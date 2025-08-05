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

    let columns = Array(repeating: GridItem(.flexible(), spacing: 2), count: 5)

    var body: some View {
        VStack {
            if let lastNum = gameState.aiHasChosenNumber {
                Text("AI chose: \(lastNum)")
                    .font(.title)
                    .fontWeight(.bold)
                    .padding(.bottom, 40)
            }

            LazyVGrid(columns: columns, spacing: 2) {
                ForEach(0..<25, id: \.self) { index in
                    let number = gameState.playerBoardNumbers[index]
                    BingoCell(
                        number: number,
                        isMarked: gameState.markedNumbers.contains(number),
                        isDisabled: gameState.markedNumbers.contains(number) || !gameState.isPlayerTurn || gameState.gameEnded
                    ) {
                        gameState.playerClickedNumber(number)
                    }
                }
            }
            .frame(width: 250, height: 250)

            Button("New Game") {
                gameState.startNewGame()
            }
            .font(.title2)
            .foregroundStyle(.white)
            .frame(width: 170, height: 55)
            .background(Color.black)
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .padding(.bottom, 20)
        }
        .alert(gameState.gameWinner ?? "", isPresented: $showAlert) {
            Button("OK", role: .cancel) {}
        }
        .onChange(of: gameState.gameWinner) { winner in
            showAlert = winner != nil
        }
    }
}

