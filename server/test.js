var mongoose = require( 'mongoose' );

var db = require( './db' );

function clearDatabase() {

  console.log( "Now cleaning up. . ." );

  return Promise.all( [
    mongoose.model( 'Bracket' ).remove(),
    mongoose.model( 'Match' ).remove(),
    mongoose.model( 'Player' ).remove(),
  ] );

}

function createBracketFromPlayerListTest() {

  console.log( "Generating player list . . ." );

  var players = [

    mongoose.model( 'Player' ).create( { name: "Joe Shmoe", seed: 1 } ),
    mongoose.model( 'Player' ).create( { name: "John Doe", seed: 2 } ),
    mongoose.model( 'Player' ).create( { name: "Mary Beth", seed: 3 } ),
    mongoose.model( 'Player' ).create( { name: "Chris Rock", seed: 4 } ),
    mongoose.model( 'Player' ).create( { name: "Bob Dole", seed: 5 } ),
    mongoose.model( 'Player' ).create( { name: "Pogchamp", seed: 6 } ),
    mongoose.model( 'Player' ).create( { name: "KingRaven", seed: 7 } ),

  ]

  return Promise.all( players ).then( function( players ) {

    console.log( "Done!", players );

    console.log( "Creating a new bracket from player list . . ." );

    return mongoose.model( 'Bracket' ).createBracketFromPlayerList( players )
    .then( function( bracket ) {

      console.log( "Created the following bracket:", JSON.stringify( bracket ) );

      console.log( "The players in each match are:" )
      var matchesRead = 0;
      for ( var i = 0; i < bracket.matches.length; ++i ) {

        mongoose.model( 'Match' ).findById( bracket.matches[i] ).populate( 'players' ).exec()
        .then( function ( match ) {

          console.log( match.toString() );
          match.setWinner( 1 ).then( function( match ) {

            matchesRead += 1;
            if ( matchesRead === bracket.matches.length ) {

              console.log( "Test completed successfully" );
              createBracketFromPreviousBracketTest( bracket._id );

            }

          } ).then( null, function( err ) {
            console.error( "There was an error:", err );
          });
        }).then( null, function( err ) {

          console.error( chalk.red( "ERROR", err ) ); 

        })

      }

    });

  });

}

function createBracketFromPreviousBracketTest( prevBracketId ) {

  console.log( "Creating bracket from previous bracket . . ." );
  return mongoose.model( 'Bracket' ).findById( prevBracketId ).populate( 'matches' ).exec()
  .then( function( prevBracket ) {

    mongoose.model( 'Bracket' ).createBracketFromCompletedBracket( prevBracket )
    .then( function( bracket ) {

      bracket.matches.forEach( function( matchId ) {

        mongoose.model( 'Match' ).findById( matchId ).populate( 'players' ).exec()
        .then( function( match ) {

          console.log( match.toString() );

        }).then( null, console.error );

      })

    })

  } ).then( null, function( err ) {
    console.error( "An error occurred:", err );
  });

}

clearDatabase().then( createBracketFromPlayerListTest )