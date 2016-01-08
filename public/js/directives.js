angular
  .module( "matchup" )
  .directive( "matchInfo", function( LadderFactory, $rootScope ) {

    return {
      restrict: 'E',
      templateUrl: '/views/dir_match.html',
      scope: {
        match: '=',
        ladderId: '='
      },
      link: function( scope ) {

        scope.reportWinner = function( winner ) {

          LadderFactory.reportMatchWinner( scope.ladderId, scope.match._id, winner )
          .then( function( match ) {
            
            // scope.match = match;
            $rootScope.$emit( 'ladder-outdated' );

          })

        }

      }
    }

  });