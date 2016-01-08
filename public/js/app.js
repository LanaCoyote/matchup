angular
  .module( "matchup", ["ui.router"] )
  .config([
    '$locationProvider',
    function( $locationProvider ) {
      
      $locationProvider.html5Mode( true );
    
    }
  ]);