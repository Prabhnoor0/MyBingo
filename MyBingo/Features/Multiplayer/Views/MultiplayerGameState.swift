//
//  MultiplayerGameState.swift
//  MyBingo
//
//  Created by Prabhnoor Kaur on 05/08/25.
//

import SwiftUI
import Combine
import Foundation

class MultiplayerGameState: ObservableObject {
    @Published var currentUser: Player?
    @Published var gameRoom: GameRoom?
    @Published var connectionStatus: ConnectionStatus = .disconnected
    @Published var errorMessage: String?
    @Published var isLoading = false
    
    // UI State
    @Published var playerName: String = ""
    @Published var roomCode: String = ""
    @Published var showingRoomCreation = false
    @Published var showingRoomJoining = false
    
    // New: Player Click State
    @Published var playerMarkedNumbers: [Int] = []
    @Published var shouldHighlightCurrentNumber = false
    @Published var hasPlayerMarkedCurrentNumber = false
    
    private let firebaseService = FirebaseService()
    private var cancellables = Set<AnyCancellable>()
    
    enum ConnectionStatus {
        case disconnected
        case connecting
        case connected
        case inRoom
        case playing
    }
    
    // MARK: - Room Management
    func createRoom() {
        guard !playerName.isEmpty else {
            errorMessage = "Please enter your name"
            return
        }
        
        isLoading = true
        connectionStatus = .connecting
        
        // First create anonymous user
        firebaseService.createAnonymousUser()
            .flatMap { [weak self] userId -> AnyPublisher<String, Error> in
                // Create player
                let player = Player(id: userId, name: self?.playerName ?? "Player")
                self?.currentUser = player
                
                // Create room and return the roomId
                guard let self = self else {
                    return Fail<String, Error>(error: NSError(domain: "MultiplayerGameState", code: 0, userInfo: [NSLocalizedDescriptionKey: "Self is nil"])).eraseToAnyPublisher()
                }
                return self.firebaseService.createGameRoom(hostId: userId, maxPlayers: 8)
            }
            .flatMap { [weak self] roomId -> AnyPublisher<String, Error> in
                // Join the created room and return roomId
                guard let self = self, let user = self.currentUser else {
                    return Fail<String, Error>(error: NSError(domain: "MultiplayerGameState", code: 0, userInfo: [NSLocalizedDescriptionKey: "User not found"])).eraseToAnyPublisher()
                }
                
                return self.firebaseService.joinGameRoom(roomId: roomId, player: user)
                    .map { _ in roomId } // Convert Void to String (roomId)
                    .eraseToAnyPublisher()
            }
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                        self?.connectionStatus = .disconnected
                    }
                },
                receiveValue: { [weak self] roomId in
                    self?.roomCode = roomId
                    self?.connectionStatus = .inRoom
                    self?.startListeningToRoom(roomId: roomId)
                }
            )
            .store(in: &cancellables)
    }

    func joinRoom() {
        guard !playerName.isEmpty, !roomCode.isEmpty else {
            errorMessage = "Please enter your name and room code"
            return
        }
        
        isLoading = true
        connectionStatus = .connecting
        let currentRoomCode = roomCode // Capture the room code
        
        firebaseService.createAnonymousUser()
            .flatMap { [weak self] userId -> AnyPublisher<Void, Error> in
                let player = Player(id: userId, name: self?.playerName ?? "Player")
                self?.currentUser = player
                
                guard let self = self else {
                    return Fail<Void, Error>(error: NSError(domain: "MultiplayerGameState", code: 0, userInfo: [NSLocalizedDescriptionKey: "Self is nil"])).eraseToAnyPublisher()
                }
                return self.firebaseService.joinGameRoom(roomId: currentRoomCode, player: player)
            }
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                        self?.connectionStatus = .disconnected
                    }
                },
                receiveValue: { [weak self] _ in
                    self?.connectionStatus = .inRoom
                    self?.startListeningToRoom(roomId: currentRoomCode)
                }
            )
            .store(in: &cancellables)
    }

    // MARK: - Game Play Logic (NEW)
    func playerClickedNumber(_ number: Int) {
        guard let currentNumber = gameRoom?.currentNumber,
              let userId = currentUser?.id,
              let roomId = gameRoom?.id else { return }
        
        // Only allow clicking the currently called number
        guard number == currentNumber else {
            errorMessage = "You can only click the number that was just called: \(currentNumber)"
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                self.errorMessage = nil
            }
            return
        }
        
        // Check if player has this number on their board
        guard currentUser?.boardNumbers.contains(number) == true else {
            errorMessage = "This number (\(number)) is not on your board!"
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                self.errorMessage = nil
            }
            return
        }
        
        // Check if already marked
        guard !playerMarkedNumbers.contains(number) else {
            return
        }
        
        // Mark the number
        playerMarkedNumbers.append(number)
        hasPlayerMarkedCurrentNumber = true
        
        // Update player's progress in Firebase
        updatePlayerProgress()
        
        // Check for BINGO
        checkForBingo()
    }

    private func updatePlayerProgress() {
        guard let userId = currentUser?.id,
              let roomId = gameRoom?.id,
              let user = currentUser else { return }
        
        // Calculate completed lines based on marked numbers
        var newCompletedLines: Set<Int> = []
        let winPositions = [
            [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24], // Rows
            [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24], // Columns
            [0,6,12,18,24], [4,8,12,16,20] // Diagonals
        ]
        
        // Check which positions are marked on the player's board
        var markedPositions: Set<Int> = []
        for (index, boardNumber) in user.boardNumbers.enumerated() {
            if playerMarkedNumbers.contains(boardNumber) {
                markedPositions.insert(index)
            }
        }
        
        // Check which lines are completed
        for (index, pattern) in winPositions.enumerated() {
            if Set(pattern).isSubset(of: markedPositions) {
                newCompletedLines.insert(index)
            }
        }
        
        // Update current user locally
        currentUser?.completedLines = Array(newCompletedLines)
        currentUser?.hasWon = newCompletedLines.count >= 5
        currentUser?.markedNumbers = playerMarkedNumbers
        
        // Update Firebase
        firebaseService.updatePlayerProgress(
            roomId: roomId,
            playerId: userId,
            completedLines: newCompletedLines,
            markedNumbers: playerMarkedNumbers,
            hasWon: newCompletedLines.count >= 5
        )
        .sink(
            receiveCompletion: { _ in },
            receiveValue: { _ in }
        )
        .store(in: &cancellables)
    }

    private func checkForBingo() {
        guard let user = currentUser else { return }
        
        if user.completedLines.count >= 5 && !user.hasWon {
            // Player has BINGO! They can now claim it
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                // Give a moment for UI to update, then highlight BINGO button
            }
        }
    }

    // MARK: - Room Management Methods
    func toggleReady() {
        guard let userId = currentUser?.id,
              let roomId = roomCode.isEmpty ? nil : roomCode else { return }
        
        // Toggle ready status in Firebase
        let newReadyStatus = !(gameRoom?.players[userId]?.isReady ?? false)
        
        firebaseService.updatePlayerReady(roomId: roomId, playerId: userId, isReady: newReadyStatus)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = "Failed to update ready status: \(error.localizedDescription)"
                    }
                },
                receiveValue: { _ in
                    // Success - the real-time listener will update the UI
                }
            )
            .store(in: &cancellables)
    }

    func startMultiplayerGame() {
        guard let roomId = roomCode.isEmpty ? nil : roomCode,
              let room = gameRoom,
              room.canStartGame else { return }
        
        isLoading = true
        
        // Reset game state for new game
        playerMarkedNumbers = []
        hasPlayerMarkedCurrentNumber = false
        shouldHighlightCurrentNumber = false
        
        firebaseService.startGame(roomId: roomId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = "Failed to start game: \(error.localizedDescription)"
                    }
                },
                receiveValue: { [weak self] _ in
                    self?.connectionStatus = .playing
                }
            )
            .store(in: &cancellables)
    }

    func leaveRoom() {
        guard let userId = currentUser?.id,
              let roomId = roomCode.isEmpty ? nil : roomCode else { return }
        
        firebaseService.leaveRoom(roomId: roomId, playerId: userId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = "Failed to leave room: \(error.localizedDescription)"
                    }
                },
                receiveValue: { [weak self] _ in
                    self?.startNewGame()
                }
            )
            .store(in: &cancellables)
    }

    func callNextNumber() {
        guard let roomId = gameRoom?.id else { return }
        
        isLoading = true
        
        firebaseService.callNextNumber(roomId: roomId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = "Failed to call number: \(error.localizedDescription)"
                    }
                },
                receiveValue: { _ in
                    // Success - real-time listener will update the UI
                }
            )
            .store(in: &cancellables)
    }

    func claimBingo() {
        guard let userId = currentUser?.id,
              let roomId = gameRoom?.id else { return }
        
        firebaseService.claimBingo(roomId: roomId, playerId: userId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = "Failed to claim BINGO: \(error.localizedDescription)"
                    }
                },
                receiveValue: { _ in
                    // Success - game will update via real-time listener
                }
            )
            .store(in: &cancellables)
    }

    // MARK: - Real-time Listening (Updated)
    private func startListeningToRoom(roomId: String) {
        firebaseService.listenToGameRoom(roomId: roomId)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] gameRoom in
                // Check if a new number was called
                if let newNumber = gameRoom?.currentNumber,
                   newNumber != self?.gameRoom?.currentNumber {
                    self?.hasPlayerMarkedCurrentNumber = false
                    self?.shouldHighlightCurrentNumber = true
                    
                    // Stop highlighting after 3 seconds
                    DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
                        self?.shouldHighlightCurrentNumber = false
                    }
                }
                
                self?.gameRoom = gameRoom
                if gameRoom?.gameState == .playing {
                    self?.connectionStatus = .playing
                } else if gameRoom?.gameState == .finished {
                    // Game ended
                }
            }
            .store(in: &cancellables)
    }
    
    func startNewGame() {
        // Reset state for new game
        gameRoom = nil
        currentUser = nil
        connectionStatus = .disconnected
        errorMessage = nil
        roomCode = ""
        playerName = ""
        playerMarkedNumbers = []
        hasPlayerMarkedCurrentNumber = false
        shouldHighlightCurrentNumber = false
    }
    
    func endGame() {
        firebaseService.stopListening()
        cancellables.removeAll()
        startNewGame()
    }
}
