//
//  ActionBar.swift
//  MyBingo
//
//  Created by Prabhnoor Kaur on 05/08/25.
//

import SwiftUI

struct ActionBar: View {
    let onNewGame: () -> Void
    
    var body: some View {
        HStack {
            Spacer()
            Button(action: onNewGame) {
                Text("New Game")
                    .font(.title2)
                    .foregroundStyle(.white)
                    .frame(width: 170, height: 55)
                    .background(Color.black)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }
            Spacer()
        }
        .padding(.vertical, 16)
    }
}
