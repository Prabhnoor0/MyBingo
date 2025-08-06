//
//  FirebaseService.swift
//  MyBingo
//
//  Created by Prabhnoor Kaur on 05/08/25.
//


import Foundation
import Firebase
import FirebaseAuth
import FirebaseDatabase
import Combine

class FirebaseService: ObservableObject {
    private let database = Database.database().reference()
    private var gameRoomListener: DatabaseHandle?
    
    // MARK: - User Management
    func createAnonymousUser() -> AnyPublisher<String, Error> {
        return Future { promise in
            Auth.auth().signInAnonymously { result, error in
                if let error = error {
                    promise(.failure(error))
                } else if let user = result?.user {
                    promise(.success(user.uid))
                } else {
                    promise(.failure(NSError(domain: "FirebaseService", code: 0, userInfo: [NSLocalizedDescriptionKey: "Failed to create user"])))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    // MARK: - Game Room Management
    func createGameRoom(hostId: String, maxPlayers: Int = 8) -> AnyPublisher<String, Error> {
        return Future { promise in
            let gameRoom = GameRoom(hostId: hostId, maxPlayers: maxPlayers)
            
            do {
                let data = try JSONEncoder().encode(gameRoom)
                let dict = try JSONSerialization.jsonObject(with: data) as? [String: Any] ?? [:]
                
                self.database.child("gameRooms").child(gameRoom.id).setValue(dict) { error, _ in
                    if let error = error {
                        promise(.failure(error))
                    } else {
                        promise(.success(gameRoom.id))
                    }
                }
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func joinGameRoom(roomId: String, player: Player) -> AnyPublisher<Void, Error> {
        return Future { promise in
            let playerRef = self.database.child("gameRooms").child(roomId).child("players").child(player.id)
            
            do {
                let data = try JSONEncoder().encode(player)
                let dict = try JSONSerialization.jsonObject(with: data) as? [String: Any] ?? [:]
                
                playerRef.setValue(dict) { error, _ in
                    if let error = error {
                        promise(.failure(error))
                    } else {
                        promise(.success(()))
                    }
                }
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func listenToGameRoom(roomId: String) -> AnyPublisher<GameRoom?, Never> {
        return Future { promise in
            self.gameRoomListener = self.database.child("gameRooms").child(roomId).observe(.value) { snapshot in
                guard let data = snapshot.value as? [String: Any] else {
                    promise(.success(nil))
                    return
                }
                
                do {
                    let jsonData = try JSONSerialization.data(withJSONObject: data)
                    let gameRoom = try JSONDecoder().decode(GameRoom.self, from: jsonData)
                    promise(.success(gameRoom))
                } catch {
                    print("Error decoding game room: \(error)")
                    promise(.success(nil))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func stopListening() {
        if let listener = gameRoomListener {
            database.removeObserver(withHandle: listener)
            gameRoomListener = nil
        }
    }
    
    // MARK: - Room Management
    func updatePlayerReady(roomId: String, playerId: String, isReady: Bool) -> AnyPublisher<Void, Error> {
        return Future { promise in
            self.database.child("gameRooms").child(roomId).child("players").child(playerId).child("isReady").setValue(isReady) { error, _ in
                if let error = error {
                    promise(.failure(error))
                } else {
                    promise(.success(()))
                }
            }
        }
        .eraseToAnyPublisher()
    }

    func startGame(roomId: String) -> AnyPublisher<Void, Error> {
        return Future { promise in
            let updates: [String: Any] = [
                "gameState": GameRoom.GameState.playing.rawValue,
                "calledNumbers": [],
                "currentNumber": NSNull()
            ]
            
            self.database.child("gameRooms").child(roomId).updateChildValues(updates) { error, _ in
                if let error = error {
                    promise(.failure(error))
                } else {
                    promise(.success(()))
                }
            }
        }
        .eraseToAnyPublisher()
    }

    func leaveRoom(roomId: String, playerId: String) -> AnyPublisher<Void, Error> {
        return Future { promise in
            self.database.child("gameRooms").child(roomId).child("players").child(playerId).removeValue { error, _ in
                if let error = error {
                    promise(.failure(error))
                } else {
                    promise(.success(()))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    // MARK: - Game Play Methods (Updated for Player Clicks)
    func callNextNumber(roomId: String) -> AnyPublisher<Void, Error> {
        return Future { promise in
            // Get current game state
            self.database.child("gameRooms").child(roomId).observeSingleEvent(of: .value) { snapshot in
                guard let data = snapshot.value as? [String: Any],
                      let calledNumbersData = data["calledNumbers"] as? [Int] else {
                    promise(.failure(NSError(domain: "FirebaseService", code: 0, userInfo: [NSLocalizedDescriptionKey: "Could not get game data"])))
                    return
                }
                
                // Get next random number that hasn't been called (1-25 for our game)
                let allNumbers = Array(1...25) // Our BINGO uses 1-25 numbers
                let availableNumbers = allNumbers.filter { !calledNumbersData.contains($0) }
                
                guard let nextNumber = availableNumbers.randomElement() else {
                    promise(.failure(NSError(domain: "FirebaseService", code: 0, userInfo: [NSLocalizedDescriptionKey: "No more numbers to call"])))
                    return
                }
                
                // Update Firebase with new number
                let newCalledNumbers = calledNumbersData + [nextNumber]
                let updates: [String: Any] = [
                    "currentNumber": nextNumber,
                    "calledNumbers": newCalledNumbers
                ]
                
                self.database.child("gameRooms").child(roomId).updateChildValues(updates) { error, _ in
                    if let error = error {
                        promise(.failure(error))
                    } else {
                        promise(.success(()))
                    }
                }
            }
        }
        .eraseToAnyPublisher()
    }

    func claimBingo(roomId: String, playerId: String) -> AnyPublisher<Void, Error> {
        return Future { promise in
            // First, get player name for winner display
            self.database.child("gameRooms").child(roomId).child("players").child(playerId).observeSingleEvent(of: .value) { snapshot in
                guard let playerData = snapshot.value as? [String: Any],
                      let playerName = playerData["name"] as? String else {
                    promise(.failure(NSError(domain: "FirebaseService", code: 0, userInfo: [NSLocalizedDescriptionKey: "Could not get player data"])))
                    return
                }
                
                // Mark player as winner and end game
                let updates: [String: Any] = [
                    "gameState": GameRoom.GameState.finished.rawValue,
                    "gameWinner": playerId,
                    "players/\(playerId)/hasWon": true
                ]
                
                self.database.child("gameRooms").child(roomId).updateChildValues(updates) { error, _ in
                    if let error = error {
                        promise(.failure(error))
                    } else {
                        promise(.success(()))
                    }
                }
            }
        }
        .eraseToAnyPublisher()
    }

    // Updated to include markedNumbers that players clicked
    func updatePlayerProgress(roomId: String, playerId: String, completedLines: Set<Int>, markedNumbers: [Int], hasWon: Bool) -> AnyPublisher<Void, Error> {
        return Future { promise in
            let updates: [String: Any] = [
                "players/\(playerId)/completedLines": Array(completedLines),
                "players/\(playerId)/markedNumbers": markedNumbers,
                "players/\(playerId)/hasWon": hasWon
            ]
            
            self.database.child("gameRooms").child(roomId).updateChildValues(updates) { error, _ in
                if let error = error {
                    promise(.failure(error))
                } else {
                    promise(.success(()))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    // MARK: - Additional Game Methods
    
    // Method to validate a BINGO claim (optional - for cheat prevention)
    func validateBingoWin(roomId: String, playerId: String) -> AnyPublisher<Bool, Error> {
        return Future { promise in
            self.database.child("gameRooms").child(roomId).child("players").child(playerId).observeSingleEvent(of: .value) { snapshot in
                guard let playerData = snapshot.value as? [String: Any],
                      let markedNumbers = playerData["markedNumbers"] as? [Int],
                      let boardNumbers = playerData["boardNumbers"] as? [Int] else {
                    promise(.failure(NSError(domain: "FirebaseService", code: 0, userInfo: [NSLocalizedDescriptionKey: "Could not validate player data"])))
                    return
                }
                
                // Validate that the player actually has BINGO
                let winPositions = [
                    [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24], // Rows
                    [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24], // Columns
                    [0,6,12,18,24], [4,8,12,16,20] // Diagonals
                ]
                
                // Check which positions are marked
                var markedPositions: Set<Int> = []
                for (index, boardNumber) in boardNumbers.enumerated() {
                    if markedNumbers.contains(boardNumber) {
                        markedPositions.insert(index)
                    }
                }
                
                // Count completed lines
                var completedLines = 0
                for pattern in winPositions {
                    if Set(pattern).isSubset(of: markedPositions) {
                        completedLines += 1
                    }
                }
                
                // Player needs 5 completed lines for BINGO
                let hasValidBingo = completedLines >= 5
                promise(.success(hasValidBingo))
            }
        }
        .eraseToAnyPublisher()
    }
    
    // Method to get game statistics (optional)
    func getGameStats(roomId: String) -> AnyPublisher<[String: Any], Error> {
        return Future { promise in
            self.database.child("gameRooms").child(roomId).observeSingleEvent(of: .value) { snapshot in
                guard let data = snapshot.value as? [String: Any] else {
                    promise(.failure(NSError(domain: "FirebaseService", code: 0, userInfo: [NSLocalizedDescriptionKey: "Could not get game data"])))
                    return
                }
                
                // Calculate game statistics
                let calledNumbers = data["calledNumbers"] as? [Int] ?? []
                let players = data["players"] as? [String: Any] ?? [:]
                
                var stats: [String: Any] = [:]
                stats["totalNumbersCalled"] = calledNumbers.count
                stats["totalPlayers"] = players.count
                stats["numbersRemaining"] = 25 - calledNumbers.count
                
                promise(.success(stats))
            }
        }
        .eraseToAnyPublisher()
    }
}
