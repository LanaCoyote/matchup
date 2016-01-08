var chalk = require( 'chalk' );
var mongoose = require( 'mongoose' );

var LadderSchema = mongoose.Schema({

  title : { type: String, required: true },
  brackets : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bracket' }],

});

LadderSchema.statics.fromPlayerList = function( playerArray, title ) {

  playerArray.forEach( function( player ) {

    player.ladder = this;
    player.save();

  });

  var newLadder = mongoose.model( 'Ladder' ).create({ title: title })
  .then( function( ladder ) {

    return mongoose.model( 'Bracket' ).fromPlayerList( playerArray, ladder )
    .then( function( bracket ) {

      ladder.brackets = [bracket];
      return ladder.save().then( function( ladder ) { return ladder._id } );

    });

  }).then( null, function( err ) {
    console.error( "[DB/Ladder]", chalk.red( "Error creating ladder from player list:" ), err );
    throw err;
  });

  return newLadder;

}

LadderSchema.methods.nextBracket = function() {

  var lastBracketId = this.brackets[ this.brackets.length - 1 ];
  var ladder = this;

  return mongoose.model( 'Bracket' ).findById( lastBracketId ).populate( 'matches' ).exec()
  .then( function( bracket ) {

    if ( bracket.matches.length > 1 ) {

      return mongoose.model( 'Bracket' ).fromCompletedBracket( bracket )
      .then( function( bracket ) {

        ladder.brackets.push( bracket );
        return ladder.save();

      }).then( function( ladder ) {

        console.log( "[DB/Ladder]", "Ladder", ladder._id, "advanced to a new bracket" );

      });

    } else {

      ladder.winner = bracket.matches[0].getWinner();
      console.log( "[DB/Ladder]", "Ladder", ladder._id, "was won by", ladder.winner.name );
      return ladder.save();

    }

  }).then( null, function( err ) {

    console.error( "[DB/Ladder]", chalk.red( "Error advancing to the next bracket:" ), err );
    throw err;

  });

}

module.exports = mongoose.model( 'Ladder', LadderSchema );