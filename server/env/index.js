var path = require( 'path' );   // node path module (for filepath parsing)

function EnvConfig( env, cfg ) {

  this.env = env;

  this.get = function( key ) {
    return cfg[key];
  }

}

var envToLoad = process.env.MATCHUP_ENV || 'dev';
var cfgPath = path.join( __dirname, './' + envToLoad + '.js' );

module.exports = EnvConfig( envToLoad, require( cfgPath ) );
