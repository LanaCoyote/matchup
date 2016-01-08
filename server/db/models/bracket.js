var chalk = require( 'chalk' );
var mongoose = require( 'mongoose' ); // mongoose for schema building

var BracketSchema = new mongoose.Schema({

  // completedMatches : { type: Number, required: true, default: 0 },
  ladder : { type: mongoose.Schema.Types.ObjectId, ref: 'Ladder' },
  matches : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }],
  matchesComplete : { type: Number, default: 0 }

});

BracketSchema.virtual( 'completedMatches' ).get( function() {

  var matchCount = 0;
  this.matches.forEach( function( match ) {
    if ( !match.isActive() ) matchCount += 1;
  });

  return matchCount;

});

BracketSchema.statics.fromPlayerList = function( playerArray, ladder ) {

  // check that the player list is valid
  if ( !Array.isArray( playerArray ) ) {
    return console.error( "[DB/BRACKET]", chalk.red( "Attempted to create bracket from non-array player list:" ), playerArray );
  }

  // create the bracket and append matches to it
  return mongoose.model( 'Bracket' ).create( { ladder: ladder } )
  .then( function( bracket ) {
    
    // initialize our matches
    var matchArray = [];
    // var numMatches = Math.ceil( playerArray.length / 2 );

    // sort the player list by rank
    playerArray.sort( function( ply1, ply2 ) {

      return ply1.seed - ply2.seed;

    } );

    // for ( var i = 0; i < numMatches; ++i ) {
    while( playerArray.length > 0 ) {

      var matchData;
      if ( playerArray.length === 0 ) {
      
        // we shouldn't hit this point
        console.error( "[DB/BRACKET]", chalk.yellow( "Ran out of players in player list when creating a new bracket. Match array so far:" ), matchArray );
        break;
      
      } else if ( playerArray.length % 2 === 1 ) {

        // give the highest seeded player a by
        var topPlayer = playerArray.shift();

        matchData = {

          bracket: bracket,
          players: [topPlayer._id],
          result: 1,  // the match starts already completed

        }

        // increment the completed matches on the bracket
        bracket.matchesComplete += 1;

      } else {

        // pick the highest and lowest seeded players
        var players = [playerArray.shift()._id, playerArray.pop()._id];

        matchData = {

          bracket: bracket,
          players: players,
          result: 0,

        }

      }

      // check that our matchData exists
      if ( matchData ) {

        // create the match and push the promise to the matchArray
        matchArray.push( mongoose.model( 'Match' ).create( matchData ).then( null, function( err ) {
          console.error( "[DB/BRACKET]", chalk.red( "Error creating match for player list bracket:" ), JSON.stringify( err ) );
        }));

      } else {
        // something went wrong
        console.error( "[DB/BRACKET]", chalk.yellow( "No matchData was received when creating a bracket from a player list" ) );
      }
    } // end while loop

    return Promise.all( matchArray ).then( function( matches ) {

      // attach the match list to our bracket
      matches = matches.map( function( match ) { return match._id } );
      bracket.matches = matches;
      return bracket.save();

    })

  }).then( null, function( err ) {
    console.error( "[DB/BRACKET]", chalk.red( "An error occurred when creating a bracket from a player list:" ), JSON.stringify( err ) );
  });

}

BracketSchema.statics.fromCompletedBracket = function( completedBracket ) {

  if ( !completedBracket.isComplete() ) {
    return console.error( "[DB/BRACKET]", chalk.red( "Attempted to create a new bracket from a non-complete bracket" ) );
  }

  return mongoose.model( "Bracket" ).create({ ladder: completedBracket.ladder })
  .then( function( bracket ) {

    var matchArray = [];
    var previousMatches = completedBracket.matches.slice();

    var getNextWinner = function() {
      return previousMatches.shift().getWinner();
    }

    while( previousMatches.length > 0 ) {

      var matchData;
      if ( previousMatches.length % 2 === 1 ) {

        // the highest seeded winner gets a by
        matchData = {

          bracket: bracket,
          players: [ getNextWinner() ],
          result: 1, // this match starts completed

        }

        bracket.matchesComplete += 1;

      } else {

        // take the next two players and put them in a new match
        var players = [ getNextWinner(), getNextWinner() ];

        matchData = {

          bracket: bracket,
          players: players,
          result: 0,

        }

      }

      if ( matchData ) {

        matchArray.push( mongoose.model( "Match" ).create( matchData ).then( null, function( err ) {
          console.error( "[DB/BRACKET]", chalk.red( "Error creating match for bracket from completed bracket:" ), JSON.stringify( err ) );
        }));

      } else {
        console.error( "[DB/BRACKET]", chalk.yellow( "No matchData was received when creating a bracket from a completed bracket" ) );
      }
    } // end while loop

    return Promise.all( matchArray ).then( function( matches ) {

      // attach the match list to our bracket
      matches = matches.map( function( match ) { return match._id } );
      bracket.matches = matches;
      return bracket.save();

    })

  }).then( null, function( err ) {
    console.error( "[DB/BRACKET]", chalk.red( "An error occurred when creating a bracket from a previous bracket:" ), JSON.stringify( err ) );
  })

}

BracketSchema.methods.isComplete = function() {

  return this.matchesComplete === this.matches.length;

}

BracketSchema.methods.matchFinished = function( match, result ) {

  // this.completedMatches += 1;
  // console.log( this.completedMatches );
  this.matchesComplete += 1;

  if ( this.isComplete() ) {

    if ( this.ladder.nextBracket ) {
      this.ladder.nextBracket();
    } else {

      mongoose.model( 'Ladder' ).findById( this.ladder ).exec()
      .then( function( ladder ) {
        ladder.nextBracket();
      }).then( null, function( err ) {
        console.error( "[DB/BRACKET]", chalk.red( "An error occurred attempting to signal that the bracket is complete:"), err );
      });

    }

  }

  return this.save();

}

module.exports = mongoose.model( 'Bracket', BracketSchema );