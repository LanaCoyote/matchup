var bodyParser = require( 'body-parser' );
var chalk = require( 'chalk' );
var express = require( 'express' );
var path = require( 'path' );

// app initialization
function appFactory() {

  require( './db' ); // init the database
  var app = express();

  // initialize all middleware
  initBodyParsingMiddleware( app );
  initLoggingMiddleware( app );
  initStaticRoutingMiddleware( app );
  initApiRoutingMiddleware( app );
  initFrontend( app );
  initErrorHandlingMiddleware( app );

  return app;

}

// parsing middleware
function initBodyParsingMiddleware( app ) {

  app.use( bodyParser.json() );
  app.use( bodyParser.urlencoded({ extended: true }));

}

// logging middleware
function initLoggingMiddleware( app ) {

  app.use( function( req, res, next ) {

    console.log( " > ", chalk.yellow( req.method ), req.url );
    if ( req.query ) console.log( " >", chalk.blue( "QUERY" ), req.query );
    if ( req.body ) console.log( " >", chalk.blue( "BODY" ), req.body );

    res.on( 'finish', function() {

      var coloring = chalk.blue;
      if ( res.statusCode - 200 < 100 ) coloring = chalk.green;
      else if ( res.statusCode - 400 < 100 ) coloring = chalk.yellow;
      else if ( res.statusCode - 500 < 100 ) coloring = chalk.red;

      console.log( " < ", coloring( res.statusCode ), res.statusMessage );

    });

    next();

  });

}

// static routing
function initStaticRoutingMiddleware( app ) {

  var staticRoutes = [
    path.join( __dirname, "../public" ),
    path.join( __dirname, "../public_modules" )
  ]

  staticRoutes.forEach( function( staticRoute ) {

    app.use( express.static( staticRoute ) );

  });

}

// api routing
function initApiRoutingMiddleware( app ) {

  app.use( '/api/', require( './api' ) );

}

function initFrontend( app ) {

  app.get( '/*', function( req, res, next ) {
    res.sendFile( path.join( __dirname, '../public/index.html' ) );
  });

}

// error handling
function initErrorHandlingMiddleware( app ) {

  app.use( function( err, req, res, next ) {

    console.log( "[APP]", chalk.magenta( err ) );
    res.status( err.status || 500 ).end();

  });

}

// start the server
appFactory().listen( 8000, function() {

  console.log( "[APP]", chalk.green( "Server started on port 8000" ) );

});