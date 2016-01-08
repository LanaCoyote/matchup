var chalk = require( 'chalk' );
var mongoose = require( 'mongoose' ); // mongoose for schema building

var eMatchResult = {

  "cancelled" : -1,
  "active" : 0,

}

var MatchSchema = new mongoose.Schema({

  bracket : { type: mongoose.Schema.Types.ObjectId, ref: 'Bracket' },
  players : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  result : { type: Number, required: true, default: 0 },

});

MatchSchema.methods.isActive = function() {

  // a match is active whenever the result is 0
  return this.result === eMatchResult[ 'active' ];

}

MatchSchema.methods.isCancelled = function() {

  // a match is cancelled whenever the result is 1
  return this.result === eMatchResult[ 'cancelled' ];

}

MatchSchema.methods.getWinner = function() {

  // a match result of 0 or less means no winner has been declared yet
  if ( this.result <= eMatchResult[ 'active' ] ) {
    return undefined;
  }

  // the match has a winner
  return this.players[ this.result - 1 ];

}

MatchSchema.methods.cancel = function() {

  // set our result to -1 (cancelled)
  this.result = eMatchResult[ 'cancelled' ];

  // alert the bracket that we're finished
  this.bracket.matchFinished( this, this.result );

  // save the match
  return this.save();

}

MatchSchema.methods.setWinner = function( player ) {

  var match = this;

  // check that there's a valid result given
  if ( typeof player === 'number' ) {
    this.result = player;
  } else {
    return console.error( "[DB/Match]", chalk.red( "Could not set match winner to" ), player );
  }

  // alert the bracket that we're finished
  var matchEnd;
  if ( this.bracket.matchFinished ) {
    matchEnd = this.bracket.matchFinished( this, this.result );
  } else {
    matchEnd = mongoose.model( 'Bracket' ).findById( this.bracket ).populate( 'matches' ).exec()
    .then( function( bracket ) {
      return bracket.matchFinished( match, match.result );
    } ).then( null, function( err ) {
      console.error( "[DB/Match]", chalk.red( "Error reporting winner to bracket:" ), err );
    })
  }

  // save the match
  return matchEnd.then( function() { return match.save() } );

}

MatchSchema.methods.toString = function() {

  return "{Match " + this.players.map( function( ply ) { return ply.toString() } ).join( ' vs ' ) + "}";

}

module.exports = mongoose.model( 'Match', MatchSchema );