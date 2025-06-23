//
//  CoreLogic.swift
//  MyBingo
//
//  Created by Prabhnoor Kaur on 23/06/25.
//

import Foundation
var playerBoardNumbers:[Int]=Array(1...25).shuffled()     //numbers written on player's board
var aiBoardNumbers:[Int]=Array(1...25).shuffled()     //numbers written on ai's board
var markedNumbers:Set<Int>=[]     //numbers which have already been marked
var aiMarkedPositions: Set<Int>=[]
var playerMarkedPositions: Set<Int>=[]
var aiLines=0
var playerLines=0
var winPositions:[[Int]]=[[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],[0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],[0,6,12,18,24],[4,10,16,22,24]]


func givenNo(number:Int){                   //marks the no for all users
    var aiWin=false
    var playerWin=false
    if(!markedNumbers.contains(number)){        //checks if number is already marked just in case
        markedNumbers.insert(number)
    if let index = aiBoardNumbers.firstIndex(of: number) {     //checks index of no in ai board
            aiMarkedPositions.insert(index)        //adds position of the number in ai board
        aiWin = checkWin(positions: aiMarkedPositions)
            
        }
        if let index = playerBoardNumbers.firstIndex(of: number) {    //checks index of no in player board
            playerMarkedPositions.insert(index)             //adds position of the number in player board
        playerWin = checkWin(positions: playerMarkedPositions)
        }
        if(aiWin||playerWin){
            if(aiWin&&playerWin){
                print("It's a tie\n Game Ends")
            }
            else if(aiWin){
                print("Ai Wins\n Game Ends")
            }
            else if(playerWin){
                print("Player Wins\n Game Ends")
            }
        }

    }
}

func isNumberMarked(number:Int)->Bool{          //checks if given no is already marked
    return markedNumbers.contains(number)
}

func newGame()->Void{                               //restarts the game
    playerBoardNumbers = Array(1...25).shuffled()   //reshuffles the player's board
    aiBoardNumbers = Array(1...25).shuffled()       //reshuffles the ai's board
    markedNumbers.removeAll()       //empties the marked numbers list as game is restarted
    aiMarkedPositions.removeAll()
    playerMarkedPositions.removeAll()
}

func checkWin(positions: Set<Int>)->Bool{
    var count=0
    for each in winPositions{
        var isPresent=true
        for pos in each{
            if(!positions.contains(pos)){
                isPresent=false
                break
            }
        }
        if(isPresent){
            count+=1
        }
        
    }
   return count>=5
}
