import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";

@Component({
  selector: 'app-friend-game',
  templateUrl: './friend-game.component.html',
  styleUrls: ['./friend-game.component.scss']
})
export class FriendGameComponent implements OnInit, AfterViewInit {

  static instance: FriendGameComponent;

  //name of the player that is going to be dynamic in the HTML
  nameplayer: string = 'PLAYER 1';

  //token to play with
  token: 'X' | 'O' = 'X';

  //winner message
  winnerMessage: string | null = null;

  //draw message
  drawMessage: string | null = null;

  //checking the board state
  boardState: string[][] = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ];


  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    console.log("step 1")
    gsap.registerPlugin(Draggable);
    FriendGameComponent.instance = this;
  }

  ngAfterViewInit(): void {
    console.log("step 2")
    //creating the draggable element X
    Draggable.create("#X");
    //creating the draggable element O
    Draggable.create("#O")

    this.createDraggableToken(this.token);

  }

  //method that helps me switch dynamically the player for each turn
  switchPlayer() {
    console.log("switching player")
    this.token = this.token === 'X' ? 'O' : 'X';
    this.nameplayer = this.nameplayer === 'PLAYER 1' ? 'PLAYER 2' : 'PLAYER 1';
    this.createDraggableToken(this.token);
  }

  //method that creates the token after the turn is finished
  createDraggableToken(token: string) {

    //selecting the container for the X or O
    const container = document.querySelector(`.${token === 'X' ? 'x-token-container' : 'o-token-container'}`);

    //creating the new token
    const newToken = this.renderer.createElement('span');
    this.renderer.addClass(newToken, 'token');
    this.renderer.addClass(newToken, token);
    newToken.innerText = token;
    this.renderer.appendChild(container, newToken);

    //making it draggable with gsap
    Draggable.create(newToken, {
      type: "x,y", //this is to know i can move it on the axes x and y
      
      // method to make it more easy to access the token
      onPress: function (this: any) {
        this.component = FriendGameComponent.instance;
      },

      onDragEnd: function (this: any) {
        const component = this.component as FriendGameComponent;

        const lastEvent = this.pointerEvent || this.interaction?.event;
        const endX = lastEvent?.clientX;
        const endY = lastEvent?.clientY;
        
        this.target.style.visibility = "hidden";
        const droppedOn = document.elementFromPoint(endX, endY);
        this.target.style.visibility = "visible";

        const cell = droppedOn?.closest(".cell");

        if (cell && !cell.classList.contains('X') && !cell.classList.contains('O')) {
          //i need these for the checking winner method
          const row = parseInt(cell.getAttribute('data-row')!);
          const col = parseInt(cell.getAttribute('data-col')!);
          component.boardState[row][col] = component.token;

          //append the token to the cell
          cell.appendChild(this.target);

          //reset transform so it doesn't look offset
          gsap.set(this.target, { x: 0, y: 0 });
          this.kill();

          //checking if there's a winner before switching player so it doesn't display the message wrongly
          const winner = component.checkWinner();
          if (winner) {
            component.winnerMessage = `${component.nameplayer} WINS, CONGRATS!`;
          } else {
            //checking if this turn could be a draw
            const allFilled = component.boardState.every(row => row.every(cell => cell !== ''));
            if (allFilled) {
              component.drawMessage = "IT’S A DRAW FOR THIS TIME";
            } else {
              //no winner or draw — switch player
              component.switchPlayer();
            }
          }

        } else {
          //if the player dragged the token 
          gsap.to(this.target, { x: 0, y: 0 });
        }
      }
    });
  }

  checkWinner(): string | null {
    //all the possible combos
    const combos = [
      [[0, 0], [0, 1], [0, 2]], // top row
      [[1, 0], [1, 1], [1, 2]], // middle row
      [[2, 0], [2, 1], [2, 2]], // bottom row
      [[0, 0], [1, 0], [2, 0]], // left column
      [[0, 1], [1, 1], [2, 1]], // middle column
      [[0, 2], [1, 2], [2, 2]], // right column
      [[0, 0], [1, 1], [2, 2]], // main diagonal (top-left to bottom-right)
      [[0, 2], [1, 1], [2, 0]]  // anti-diagonal (top-right to bottom-left)
    ];

    //starting to loop between every possible combo
    for (const combo of combos) {
      //destructuring each combo in three coordinate pairs
      const [a, b, c] = combo;
      //gets the value at the first position
      const first = this.boardState[a[0]][a[1]];
      //checking if the first cell is not empty and all three cells have the same value
      if (first && first === this.boardState[b[0]][b[1]] && first === this.boardState[c[0]][c[1]]) {
        return first;
      }
    }
    return null;
  }

  //method to reset the game
  resetGame(): void {
    //reset board state
    this.boardState = [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ];

    //reset messages
    this.winnerMessage = null;
    this.drawMessage = null;

    //reset token and player name
    this.token = 'X';
    this.nameplayer = 'PLAYER 1';

    //clear tokens from the board
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.innerHTML = '';
    });

    //create initial draggable token
    this.createDraggableToken(this.token);
  }
}

