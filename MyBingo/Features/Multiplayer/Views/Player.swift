//
//  Player.swift
//  MyBingo
//
//  Created by Prabhnoor Kaur on 05/08/25.
//


// Features/Multiplayer/Models/Player.swift

import Foundation

struct Player: Identifiable, Codable, Hashable {
    let id: String
    let name: String
    let boardNumbers: [Int]
    let markedPositions: Set<Int>
    let hasWon: Bool
    let joinedAt: Date
}
