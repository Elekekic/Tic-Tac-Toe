import { AfterViewInit, Component, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";



@Component({
  selector: 'app-friend-game',
  templateUrl: './friend-game.component.html',
  styleUrls: ['./friend-game.component.scss']
})
export class FriendGameComponent implements OnInit, AfterViewInit {

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

  static instance: FriendGameComponent;
  constructor(private renderer: Renderer2) { }

  /*  ngOnChanges(): void {
     //creating another draggable token when the player drags a token to put it in the board
     this.createDraggableToken(this.token);
   } */

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

  createDraggableToken(token: string) {
    console.log("creating draggable token")
    //selecting the container for the X or O
    const container = document.querySelector(`.${token === 'X' ? 'x-token-container' : 'o-token-container'}`);
    console.log('container:', container);

    const newToken = this.renderer.createElement('span');
    this.renderer.addClass(newToken, 'token');
    this.renderer.addClass(newToken, token);
    newToken.innerText = token;

    this.renderer.appendChild(container, newToken);

    Draggable.create(newToken, {
      type: "x,y",
      onPress: function (this: any) {
        this.component = FriendGameComponent.instance;
      },

      onDragEnd: function (this: any) {
        console.log("located it")
        const component = this.component as FriendGameComponent;
        const lastEvent = this.pointerEvent || this.interaction?.event;
        const endX = lastEvent?.clientX;
        const endY = lastEvent?.clientY;
        console.log("Corrected endX:", endX, "endY:", endY);
        this.target.style.visibility = "hidden";
        const droppedOn = document.elementFromPoint(endX, endY);
        this.target.style.visibility = "visible";

        console.log("Real droppedOn:", droppedOn);

        const cell = droppedOn?.closest(".cell");

        if (cell && !cell.classList.contains('X') && !cell.classList.contains('O')) {
          const row = parseInt(cell.getAttribute('data-row')!);
          const col = parseInt(cell.getAttribute('data-col')!);

          cell.classList.add('token', component.token);
          component.boardState[row][col] = component.token;

          // Append the token to the cell
          cell.appendChild(this.target);

          // Reset transform so it doesn't look offset
          gsap.set(this.target, { x: 0, y: 0 });
          this.kill();

          //checking if there's a winner before switching player so it doesn't display the message wrongly
          const winner = component.checkWinner();
          if (winner) {
            component.winnerMessage = `${component.nameplayer} WINS, CONGRATS!`;
          } else {
            // Check for draw: if all cells are filled and no winner
            const allFilled = component.boardState.every(row => row.every(cell => cell !== ''));
            if (allFilled) {
              component.drawMessage = "IT’S A DRAW FOR THIS TIME";
            } else {
              // No winner or draw — switch player
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

  resetGame(): void {
    // Reset board state
    this.boardState = [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ];

    // Reset messages
    this.winnerMessage = null;
    this.drawMessage = null;

    // Reset token and player name
    this.token = 'X';
    this.nameplayer = 'PLAYER 1';

    // Clear tokens from the board
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.classList.remove('X', 'O', 'token');
      cell.innerHTML = '';
    });

    // Remove remaining draggable tokens
    document.querySelectorAll('.token.X, .token.O').forEach(el => el.remove());

    // Create initial draggable token
    setTimeout(() => {
      this.createDraggableToken(this.token);
    }, 300);
  }
}

