//
//  ContentView.swift
//  MyBingo
//
//  Created by Prabhnoor Kaur on 23/06/25.
//

import SwiftUI

struct ContentView: View {
    @State private var aiChosenNumber:Int?=nil
    @State private var winnerMessage:String?=nil
    @State private var showAlert=false
    let column: [GridItem] = Array(repeating: GridItem(.flexible(), spacing: 2), count: 5)

    var body: some View {
        
        VStack(alignment: .center) {
            Text("MyBingo")
                .font(.system(.largeTitle, design: .rounded).weight(.black))
                .kerning(3)
                .italic()
                .foregroundColor(.gray)
                .padding(.top, 20)
            
            Spacer()
              
            Text("AI chose: \(aiChosenNumber ?? 0)")
                .font(.title)
                .fontWeight(.bold)
                .padding(.bottom, 40)
            LazyVGrid(columns: column, spacing: 2) {
                ForEach(0..<25, id: \.self) { index in
                    BINGOWORK(
                        number: playerBoardNumbers[index],
                        isDisabled: markedNumbers.contains(playerBoardNumbers[index]) || !isPlayerTurn || gameEnded
                    ) {
                        playerTappedNumber( playerBoardNumbers[index])
                    }
                }
            }
            .frame(width: 250, height: 250)
            
            Spacer()
            Button(action: {newGame()
                aiChosenNumber = nil
                   winnerMessage = nil
                   showAlert = false},
                   label: {Text("New Game")
                    .font(.title)
                .foregroundStyle(.brown)
            .background(Color.black)
            .frame(width: 170, height:65)
            .background(Color.black)
            .clipShape(RoundedRectangle(cornerRadius: 10))
                .padding(.bottom, 20)
            })
            
           
            
        }  .alert(winnerMessage ?? "", isPresented: $showAlert) {
            Button("OK", role: .cancel){
               
            }
            
        }
    }
func playerTappedNumber(_ number: Int) {
        if !gameEnded && isPlayerTurn {
            playerClickedNumber(numberChosen: number)
            aiChosenNumber = aiHasChosenNumber
        }
      if let winner = gameWinner {
        winnerMessage = winner
        showAlert = true
      }
    }
}



#Preview {
    ContentView()
}
