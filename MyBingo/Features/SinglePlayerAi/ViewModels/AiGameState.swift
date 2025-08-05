//
//  AiGameSwift.swift
//  MyBingo
//
//  Created by Prabhnoor Kaur on 05/08/25.
//

import Foundation
import SwiftUI

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
    @Published var lastPlayerChoice: Int? = nil
    @Published var aiHasChosenNumber: Int? = nil
    
    // New: Track completed lines for visual effects
    @Published var playerCompletedLines: Set<Int> = []
    @Published var aiCompletedLines: Set<Int> = []

    private let winPositions: [[Int]] = [
        [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14],     // Rows
        [15,16,17,18,19], [20,21,22,23,24],              // Rows
        [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22],  // Columns
        [3,8,13,18,23], [4,9,14,19,24],                  // Columns
        [0,6,12,18,24], [4,8,12,16,20]                   // Diagonals
    ]

    init() {
        startNewGame()
    }

    func startNewGame() {
        playerBoardNumbers = Array(1...25).shuffled()
        aiBoardNumbers = Array(1...25).shuffled()
        markedNumbers.removeAll()
        aiMarkedPositions.removeAll()
        playerMarkedPositions.removeAll()
        playerCompletedLines.removeAll()
        aiCompletedLines.removeAll()
        aiWin = false
        playerWin = false
        gameEnded = false
        isPlayerTurn = true
        gameWinner = nil
        lastPlayerChoice = nil
        aiHasChosenNumber = nil
    }

    func playerClickedNumber(_ number: Int) {
        guard !gameEnded && isPlayerTurn else { return }
        
        lastPlayerChoice = number
        markNumber(number)
        isPlayerTurn = false

        if !gameEnded {
            DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(1500)) {
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
            updateCompletedLines(for: aiMarkedPositions, completedLines: &aiCompletedLines)
            aiWin = checkWin(positions: aiMarkedPositions)
        }

        // Check Player board
        if let index = playerBoardNumbers.firstIndex(of: number) {
            playerMarkedPositions.insert(index)
            updateCompletedLines(for: playerMarkedPositions, completedLines: &playerCompletedLines)
            playerWin = checkWin(positions: playerMarkedPositions)
        }

        if aiWin || playerWin {
            gameEnded = true
            if aiWin && playerWin {
                gameWinner = "It's a tie!"
            } else if aiWin {
                gameWinner = "AI Wins!"
            } else if playerWin {
                gameWinner = "You Win!"
            }
        }
    }
    
    private func updateCompletedLines(for positions: Set<Int>, completedLines: inout Set<Int>) {
        for (index, pattern) in winPositions.enumerated() {
            if Set(pattern).isSubset(of: positions) && !completedLines.contains(index) {
                completedLines.insert(index)
            }
        }
    }

    private func checkWin(positions: Set<Int>) -> Bool {
        let completedCount = winPositions.enumerated().filter { (_, pattern) in
            Set(pattern).isSubset(of: positions)
        }.count
        return completedCount >= 5
    }
    
    func endGame() {
        gameEnded = true
        gameWinner = "Game ended by player"
    }
}
