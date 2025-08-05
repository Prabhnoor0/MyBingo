//
//  Player.swift
//  MyBingo
//
//  Created by Prabhnoor Kaur on 05/08/25.
//


import Foundation

struct Player: Identifiable, Codable, Hashable {
    let id: String
    var name: String
    var boardNumbers: [Int]
    var markedPositions: Set<Int>
    var completedLines: Set<Int>
    var hasWon: Bool
    var joinedAt: Date
    var isReady: Bool
    
    init(id: String, name: String) {
        self.id = id
        self.name = name
        self.boardNumbers = Array(1...25).shuffled()
        self.markedPositions = []
        self.completedLines = []
        self.hasWon = false
        self.joinedAt = Date()
        self.isReady = false
    }
}

