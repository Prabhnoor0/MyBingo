//
//  MyBingoApp.swift
//  MyBingo
//
//  Created by Prabhnoor Kaur on 23/06/25.
//

import SwiftUI
import Firebase

@main
struct MyBingoApp: App {
    
    init() {
        FirebaseApp.configure()
    }
    
    var body: some Scene {
        WindowGroup {
            ModeSelectionView()
        }
    }
}

