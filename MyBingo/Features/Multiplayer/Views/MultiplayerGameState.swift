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

    private func startListeningToRoom(roomId: String) {
        firebaseService.listenToGameRoom(roomId: roomId)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] gameRoom in
                self?.gameRoom = gameRoom
                if gameRoom?.gameState == .playing {
                    self?.connectionStatus = .playing
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
    }
    
    func endGame() {
        firebaseService.stopListening()
        cancellables.removeAll()
        startNewGame()
    }
}
