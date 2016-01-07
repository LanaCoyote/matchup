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
      ladder.save();

    });

  }).then( null, function( err ) {
    console.error( "[DB/Ladder]", chalk.red( "Error creating ladder from player list:" ), err );
    throw err;
  });

  return newLadder;

}

module.exports = mongoose.model( 'Ladder', LadderSchema );