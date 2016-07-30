"use strict";
/*
var fs = require('fs');
var _ = require('lodash');

var lines = fs.readFileSync('./text710.dat.txt').toString().split(/\n/);
var dict = lines.map(d=>d.substr(0,23).trim())
                  .filter(d=>d.match(/^[a-z]+$/))
                  .filter(d=>d.length >= 4);
console.log(JSON.stringify(dict,null,2));
process.exit();
//console.log(dict.slice(0,100).join(','));
*/

function remainingWords({sofar, ghostlevel} ={}) {
  if (ghostlevel === 1) {
    return dict.filter(d=>d.match("^" + sofar + '.'));
  }
  if (ghostlevel === 2) {
    return dict.filter(d=>d.match(sofar) && d.length > sofar.length);
  }
}

/*
var words = remainingWords({sofar:'bac', ghostlevel:2, players: 2});
console.log(JSON.stringify(words, null, 2));
*/


function losingWords({sofar, ghostlevel, } = {}) {
  if (ghostlevel === 1) {
    var losing = dict.filter(d=>d.match("^" + sofar + '.$'));
    return losing;
  }
}
function notLosingWords({sofar, ghostlevel} = {}) {
  if (ghostlevel === 1) {
    var remaining = remainingWords({sofar, ghostlevel});
    return remaining.filter(d=>!isWord(d.substr(0, sofar.length+1)));
    //return _.difference(remaining, losingWords({sofar, ghostlevel}));
  }
}
function enders(words) { // exclude from list any word that includes
                         // another word on the list
  // this could only help for level 1
}
function isWord(word) {
  return _.contains(dict, word);
}

function minimax({sofar, depth, maximizingPlayer, ghostlevel, players} = {}) {
  // https://en.wikipedia.org/wiki/Minimax
  if (players !== 2)
    throw new Error("can only handle two players with this minimax code");

  var letters = possibleTurns({sofar, ghostlevel});
  console.log(`got ${sofar} at depth ${depth} for ${maximizingPlayer ? 'max' : 'min'}imizing player, possible turns: ${letters.join(',')}`);
  if (isWord(sofar))
    return -100;
  if (depth === 0 || letters.length === 0) {
    //return the heuristic value of node
    return letters.length
  }

  if (maximizingPlayer) {
    var bestValue = -Infinity;
    letters.forEach(letter => {
      var letterValue = minimax({sofar:sofar + letter, depth:depth-1, maximizingPlayer:false, ghostlevel, players});
      bestValue = Math.max(bestValue, letterValue);
    })
    return bestValue;
  } else { // minimizing player
    var bestValue = Infinity;
    letters.forEach(letter => {
      var letterValue = minimax({sofar:sofar + letter, depth:depth-1, maximizingPlayer:true, ghostlevel, players});
      bestValue = Math.min(bestValue, letterValue);
    })
  }
  //console.log(`value of ${sofar} at depth ${depth} for ${maximizingPlayer ? 'max' : 'min'}imizing player is ${bestValue}`);
  return bestValue;
}
function whoseWords({turn, words, ghostlevel, players} = {}) {
  var whose = { mine: [], notmine: [] };
  words.forEach(word => {
    if (isWinning({turn, ghostlevel, players, word})) {
      whose.mine.push(word);
    } else {
      whose.notmine.push(word);
    }
  });
  return whose;
}
function isWinning({turn, ghostlevel, players, word} = {}) {
  if ((word.length - turn.length) % players !== 0) 
    return true;
}
function possibleTurns({sofar, ghostlevel} = {}) {
  if (ghostlevel === 1) {
    var words = notLosingWords({sofar, ghostlevel});
    //console.log(`sofar: ${sofar}, notlosing: ${words.join(',')}`);
    var turns = _.chain(words)
                  .map(d=>d.substr(sofar.length, 1).trim())
                  .compact()
                  .uniq()
                  .value()
    //console.log(`turns: ${turns.join(',')}`);
    return turns;
  }
}
function evalTurns({sofar, ghostlevel, players, turnplayer=0, depth=0} = {}) {
  var turn = {
    sofar,
    turnplayer,
    possibleLetters: possibleTurns({sofar, ghostlevel})
  };
  if (turn.possibleLetters.length === 0) {
    turn.response = 'challenge';
    if (turnplayer === 0)
      turn.result === 'win';
    return turn;
  }
  console.log('before',turn);
  turn.possibleTurns = turn.possibleLetters.map(letter=>{
    var next =  evalTurns({sofar:sofar + letter, ghostlevel, players, turnplayer:(turnplayer+1)%players, depth:depth+1});
    if (turnplayer === 0 && next.response === "challenge")
      next.result = "lose";
    return next;
  });
  console.log('after',turn);
  return turn;
  return turnInfo;
  var winningWords = remaining.filter(word=>isWinning(
    {turn:word.substr(0,sofar.length + 1), ghostlevel, players, word}));
  if (winningWords.length === 0) return 'lost';
  return winningWords;
  var letters = possibleTurns({sofar, ghostlevel});
  letters.forEach(letter => {
    var remaining = remainingWords({sofar:sofar + letter, ghostlevel});
    var whose = whoseWords({words:remaining, ghostlevel, players, mynext:sofar.length + 2});
    console.log(`sofar: ${sofar}, turn: ${letter}, whose: ${JSON.stringify(whose)}`);
    //var val = minimax({sofar: sofar + letter, ghostlevel:1, players: 2, depth: 5, maximizingPlayer:true});
  });
}
var [_node, _path, sofar, players=2, ghostlevel=1] = process.argv;
console.log(`sofar: ${sofar}, players: ${players}, ghostlevel: ${ghostlevel}`);
var turnInfo = evalTurns({sofar, ghostlevel, players, origplayer:0});
//var turnInfo = evalTurns({sofar:'bac', ghostlevel:1, players: 2});
console.log(JSON.stringify(turnInfo, null, 2));

/*
    var whose = whoseWords({words:remaining, ghostlevel, players, mynext:sofar.length + 1});
    console.log(whose);
    return;
    return _.difference(remaining, losingWords(sofar, ghostlevel));
  */
