//
//  AIGameState.swift
//  MyBingo
//
//  Created by Prabhnoor Kaur on 04/08/25.
//

import SwiftUI
import Combine

class AIGameState: ObservableObject {
    @Published var playerBoardNumbers: [Int] = []
    @Published var aiBoardNumbers: [Int] = []
    @Published var markedNumbers: Set<Int> = []
    @Published var aiMarkedPositions: Set<Int> = []
    @Published var playerMarkedPositions: Set<Int> = []
    @Published var aiWin = false
    @Published var playerWin = false
    @Published var gameWinner: String? = nil
    @Published var gameEnded = false
    @Published var isPlayerTurn = true
    @Published var aiHasChosenNumber: Int? = nil
    
    private let winPositions: [[Int]] = [
        [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14],
        [15,16,17,18,19], [20,21,22,23,24],
        [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22],
        [3,8,13,18,23], [4,9,14,19,24],
        [0,6,12,18,24], [4,8,12,16,20]
    ]
    
    func startNewGame() {
        playerBoardNumbers = Array(1...25).shuffled()
        aiBoardNumbers = Array(1...25).shuffled()
        markedNumbers.removeAll()
        aiMarkedPositions.removeAll()
        playerMarkedPositions.removeAll()
        aiWin = false
        playerWin = false
        gameEnded = false
        isPlayerTurn = true
        gameWinner = nil
        aiHasChosenNumber = nil
    }
    
    func playerClickedNumber(_ number: Int) {
        guard !gameEnded && isPlayerTurn else { return }
        
        markNumber(number)
        isPlayerTurn = false
        
        if !gameEnded {
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                self.aiChooseNumber()
                self.isPlayerTurn = true
            }
        }
    }
    
    private func aiChooseNumber() {
        let aiRemainingNumbers = aiBoardNumbers.filter { !markedNumbers.contains($0) }
        guard !aiRemainingNumbers.isEmpty else { return }
        
        if let aiNumber = aiRemainingNumbers.randomElement() {
            aiHasChosenNumber = aiNumber
            markNumber(aiNumber)
        }
    }
    
    private func markNumber(_ number: Int) {
        guard !gameEnded && !markedNumbers.contains(number) else { return }
        
        markedNumbers.insert(number)
        
        // Check AI board
        if let index = aiBoardNumbers.firstIndex(of: number) {
            aiMarkedPositions.insert(index)
            aiWin = checkWin(positions: aiMarkedPositions)
        }
        
        // Check player board
        if let index = playerBoardNumbers.firstIndex(of: number) {
            playerMarkedPositions.insert(index)
            playerWin = checkWin(positions: playerMarkedPositions)
        }
        
        // Determine winner
        if aiWin || playerWin {
            gameEnded = true
            if aiWin && playerWin {
                gameWinner = "It's a tie!\nGame Ends"
            } else if aiWin {
                gameWinner = "AI Wins!\nGame Ends"
            } else if playerWin {
                gameWinner = "You Win!\nGame Ends"
            }
        }
    }
    
    private func checkWin(positions: Set<Int>) -> Bool {
        let completedLines = winPositions.filter { pattern in
            Set(pattern).isSubset(of: positions)
        }
        return completedLines.count >= 5
    }
    
    func endGame() {
        gameEnded = true
    }
}
