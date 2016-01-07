var chalk     = require( 'chalk' )    // chalk for coloring 
var mongoose  = require( 'mongoose' ) // mongoose for database interaction
var path      = require( 'path' )     // node path module for parsing filepaths

// little helper debug function
var debugOut = console.log.bind( null, "[DB]" );

// establish connection to the database
var env       = require( '../env' );
var db_uri    = env.get( 'DATABASE_URI' );
var db        = mongoose.connect( db_uri ).connection;

// load modules into application
require( './models' );

debugOut( "Opening MongoDB connection at", db_uri, chalk.yellow( ". . ." ) );
module.exports = new Promise( function( resolve, reject ) {

  db.on( 'error', reject );
  db.on( 'open', resolve ); 

}).then( function() {

  debugOut( chalk.green( "MongoDB connection was successful!" ) );

}).then( null, function( err ) {

  debugOut( chalk.red( "An error occurred during database connection:" ), JSON.stringify( err ) );

});
