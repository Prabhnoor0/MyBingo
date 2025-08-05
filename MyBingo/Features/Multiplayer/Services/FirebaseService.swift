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
}
