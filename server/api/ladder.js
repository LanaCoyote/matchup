var mongoose = require( 'mongoose' );
var router = require( 'express' ).Router();

// LOAD THE LADDER WHEN WE GET A LADDER ID
router.param( 'ladderId', function( req, res, next, id ) {

  mongoose.model( 'Ladder' ).findById( id ).exec()
  .then( function( ladder ) {

    if ( ladder === null ) {
      next( new ValueError( "Ladder does not exist" ) );
    }

    req.ladder = ladder;
    next();

  }).then( null, next );

});

// LOAD THE BRACKET WHEN WE GET A BRACKET ID
router.param( 'bracketIdx', function( req, res, next, idx ) {

  mongoose.model( 'Bracket' ).findById( req.ladder.brackets[idx] ).populate( 'matches' ).exec()
  .then( function( bracket ) {

    if ( bracket === null ) {
      next( new ValueError( "Ladder has no bracket " + idx.toString() ) );
    }

    req.ladder.brackets[idx] = bracket;
    req.bracket = bracket;
    next();

  }).then( null, next );

});

// GET ALL LADDERS
router.get( '/', function( req, res, next ) {

  mongoose.model( 'Ladder' ).find().exec()
  .then( function( ladders ) {

    res.status( 200 ).json( ladders );

  }).then( null, next );

});

// GET ONE LADDER
router.get( '/:ladderId', function( req, res, next ) {

  res.status( 200 ).json( req.ladder );

});

// GET ALL PLAYERS ON ONE LADDER
router.get( '/:ladderId/players', function( req, res, next ) {

  mongoose.model( 'Player' ).find( { ladder: req.ladder._id } ).exec()
  .then( function( players ) {

    res.status( 200 ).json( players );

  }).then( null, next );

});

// GET ALL BRACKETS ON ONE LADDER 
router.get( '/:ladderId/brackets', function( req, res, next ) {

  Promise.all( req.ladder.brackets.map( function( bracket ) {

    return mongoose.model( 'Bracket' ).findById( bracket ).exec();

  }) ).then( function( brackets ) {

    res.status( 200 ).json( brackets );

  }).then( null, next );

});
 
// GET ONE BRACKET (this deep populates it with match info)
router.get( '/:ladderId/brackets/:bracketIdx', function( req, res, next ) {

  Promise.all( req.bracket.matches.map( function( match ) {

    return mongoose.model( 'Match' ).findById( match ).populate( 'players' ).exec();

  }) ).then( function( matches ) {

    res.status( 200 ).json( matches );

  }).then( null, next );

});

// CREATE A NEW LADDER FROM A POST REQUEST
router.post( '/', function( req, res, next ) {

  // validate the incoming reqest
  if ( req.body.title === undefined || req.body.players === undefined ) {
    return next( new TypeError( "Post request invalid" ) );
  } else if ( typeof req.body.title !== "string" ) {
    return next( new TypeError( "Ladder title must be a string" ) );
  } else if ( !Array.isArray( req.body.players ) ) {
    return next( new TypeError( "Ladder players must be an array" ) );
  }

  // create the players
  Promise.all( req.body.players.map( function( playerData ) {

    return mongoose.model( 'Player' ).create( playerData );

  }) ).then( function( players ) {

    return mongoose.model( 'Ladder' ).fromPlayerList( players, req.body.title );

  }).then( function( ladder ) {

    res.status( 201 ).json( ladder );

  }).then( null, next );

});

module.exports = router;