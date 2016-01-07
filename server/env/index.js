var chalk = require( 'chalk' );
var path = require( 'path' );   // node path module (for filepath parsing)

function EnvConfig( env, cfg ) {

  this.env = env;

  this.get = function( key ) {
    return cfg[key];
  }

}

var envToLoad = process.env.MATCHUP_ENV || 'dev';
var cfgPath = path.join( __dirname, './' + envToLoad + '.js' );

console.log( "[ENV]", "Now loading environment settings for", envToLoad, ". . ." );

module.exports = new EnvConfig( envToLoad, require( cfgPath ) );

console.log( "[ENV]", chalk.green( "Environment settings loaded successfully!" ) );