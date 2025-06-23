//
//  ContentView.swift
//  MyBingo
//
//  Created by Prabhnoor Kaur on 23/06/25.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("MyBingo")
             .font(.system(.largeTitle, design: .rounded).weight(.black))
            .kerning(3)
             .italic()
             .foregroundColor(.gray)
    }
}

#Preview {
    ContentView()
}
