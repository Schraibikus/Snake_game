"use strict";

let snake = [];
let direction = "y+"; // Ползем направо
var snakeSpeed = 500;
let snakeTimer;
let score = 0;
let iKnowSideOfField = findSideField();
// let iKnowSideOfField = 15; //для отладки, чтобы каждый раз модалка не всплывала
let myRecord = 0;
let btnRestart;
let btnRecordClear;

function initGame() {
  // Скрываем кнопки рестарта и обнуления рекорда
  btnRestart = document.getElementById("btn");
  btnRestart.classList.add("btn--invisible");
  btnRecordClear = document.getElementById("btnClear");
  btnRecordClear.classList.add("btn--invisible");

  createGameField(iKnowSideOfField);
  startGame();
  // Храним рекорд в localStorage
  document.addEventListener("DOMContentLoaded", () => {
    myRecord = localStorage.getItem("myRecord");
    if (myRecord) getRecordInHtml();
  });
  // Обнуляем рекорд при желании
  myRecord = localStorage.getItem("myRecord");
  document.getElementById("btnClear").addEventListener("click", () => {
    localStorage.clear();
    console.log("Данные удалены");
  });
  document.getElementById("btn").addEventListener("click", restartGame);
  addEventListener("keydown", changeDirectionSnake);
}

function startGame() {
  // gameIsRunning = true;
  createSnake();
  snakeTimer = setInterval(() => move(), snakeSpeed);
  //Яблоко появится не сразу, через 1500 ms
  setTimeout(createFood, 1500);
}

function restartGame() {
  location.reload();
}

// Узнаем у игрока размер игрового поля не более 30, 10 по умолчанию
function findSideField() {
  let sideField = prompt("Введите размер игрового поля (*не более 30)", 10);
  while (
    sideField === null ||
    sideField.trim() === "" ||
    sideField < 10 ||
    sideField > 30
  ) {
    alert(
      "Поле не соответствует рекомендованному размеру, введите другое число"
    );
    sideField = prompt("Введите размер игрового поля (*не более 30)", 10);
  }
  sideField = Number(sideField);
  return sideField;
}

// Создаем игровое поля с заданными игроком размерами
function createGameField(iKnowSideOfField) {
  let gameField = document.createElement("div");
  gameField.setAttribute("class", "cell-items");
  gameField.style.setProperty("--sideField", iKnowSideOfField);

  //в цикле генерируем ячейки игрового поля
  for (let i = 1; i <= iKnowSideOfField; i++) {
    for (let j = 1; j <= iKnowSideOfField; j++) {
      let cell = document.createElement("div");
      cell.setAttribute("class", "cell");
      // через id мне показалось, что сделать легче
      cell.id = `cell-${i}-${j}`;
      // через data-аттрибуты не хватило знаний, но я пытался))
      // cell.setAttribute("data-x", `${i}`);
      // cell.setAttribute("data-y", `${j}`);
      gameField.appendChild(cell);
    }
  }
  return document.getElementById("game-field").appendChild(gameField);
}

// Создаем змейку
function createSnake() {
  let snakeStartX = Math.floor(iKnowSideOfField / 2);
  let snakeStartY = Math.floor(iKnowSideOfField / 2);

  let snakeHead = document.getElementById(
    "cell-" + snakeStartX + "-" + snakeStartY
  );
  let snakeTail = document.getElementById(
    "cell-" + snakeStartX + "-" + (snakeStartY - 1)
  );
  snake.push(snakeTail);
  snake.push(snakeHead);
}

// Движение змейки
function move() {
  let snakeHeadClasses = snake[snake.length - 1].getAttribute("id").split(" ");

  let newUnit;
  let snakeCoords = snakeHeadClasses[0].split("-");
  let coordX = Number(snakeCoords[1]);
  let coordY = Number(snakeCoords[2]);

  if (direction == "y+") {
    newUnit = document.getElementById("cell-" + coordX + "-" + (coordY + 1));
  } else if (direction == "y-") {
    newUnit = document.getElementById("cell-" + coordX + "-" + (coordY - 1));
  } else if (direction == "x+") {
    newUnit = document.getElementById("cell-" + (coordX + 1) + "-" + coordY);
  } else if (direction == "x-") {
    newUnit = document.getElementById("cell-" + (coordX - 1) + "-" + coordY);
  }

  if (!isSnakeUnit(newUnit) && newUnit !== undefined && newUnit !== null) {
    newUnit.className += " snake-unit";
    snake.push(newUnit);
    // подключаем функцию для вывода счёта в реальном времени
    getScoreInHtml();
    getRecordInHtml();
    //если змейка не ела, рубим хвост
    if (!giveMeFood(newUnit)) {
      let removeTail = snake.splice(0, 1)[0];
      let removeClassTail = removeTail.getAttribute("class").split(" ");
      removeTail.setAttribute("class", removeClassTail[0]);
    }
  } else {
    finishGame();
  }
}

// Проверяем элемент на принадлежность змейке
function isSnakeUnit(unit) {
  let check = false;
  if (snake.includes(unit)) {
    check = true;
  }
  return check;
}

// Проверяем встречу с яблоком
function giveMeFood(unit) {
  let check = false;
  let unitId = unit.getAttribute("class").split(" ");
  // Нашли яблоко
  if (unitId.includes("food")) {
    check = true;
    //Удаляем яблоко с поля
    unit.setAttribute("class", unitId[0] + " snake-unit");
    // Создаем новое яблоко
    createFood();
    //Увеличиваем счёт
    score++;
  }
  return check;
}

// Создаем яблоко в случайно месте
function createFood() {
  let foodCreated = false;
  while (!foodCreated) {
    let foodRandomX = Math.floor(Math.random() * iKnowSideOfField + 1);
    let foodRandomY = Math.floor(Math.random() * iKnowSideOfField + 1);

    let foodCell = document.getElementById(
      "cell-" + foodRandomX + "-" + foodRandomY
    );
    let foodCellClasses = foodCell.getAttribute("class").split(" ");
    if (!foodCellClasses.includes("snake-unit")) {
      let classes = "";
      for (let i = 0; i < foodCellClasses.length; i++) {
        classes += foodCellClasses[i] + " ";
      }
      foodCell.className += " food";
      foodCreated = true;
    }
  }
}

function changeDirectionSnake(e) {
  switch (e.key) {
    case "ArrowLeft":
      //если нажата клавиша влево если до этого двигались вправо, то ничего не произойдет
      if (direction != "y-") direction = "y-";
      break;
    case "ArrowUp":
      //если нажата клавиша вверх
      if (direction != "x-") direction = "x-";
      break;
    case "ArrowRight":
      //если нажата клавиша вправо
      if (direction != "y+") direction = "y+";
      break;
    case "ArrowDown":
      //если нажата клавиша вниз
      if (direction != "x+") direction = "x+";
      break;
  }
}

function getScoreInHtml() {
  let scoreInHtml = document.getElementById("score");
  scoreInHtml.innerHTML = score;
}

function getRecordInHtml() {
  let recordInHtml = document.getElementById("record");
  recordInHtml.innerHTML = myRecord;
}

function finishGame() {
  // Возвращаем кнопки назад
  btnRestart.classList.remove("btn--invisible");
  btnRecordClear.classList.remove("btn--invisible");
  // Проверяем на рекорд
  if (score >= myRecord) {
    alert("Новый рекорд!!! " + score);
    localStorage.setItem("myRecord", score);
  } else {
    localStorage.setItem("myRecord", myRecord);
  }

  clearInterval(snakeTimer);
  console.log("Игра закончена, Вы собрали " + score + " шт. Пикачу");
  alert("Игра закончена, Вы собрали " + score + " шт. Пикачу");
}

window.onload = initGame;
