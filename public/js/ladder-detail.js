angular
  .module( "matchup" )
  .controller( "LadderDetailCtrl", function( $scope, $rootScope, ladder, LadderFactory ) {

    $scope.ladder = ladder;

    $scope.reloadLadder = function() {
      
      LadderFactory.fetchById( $scope.ladder._id )
      .then( function( ladder ) {
        $scope.ladder = ladder;
      });

    }

    $rootScope.$on( 'ladder-outdated', function() {
      $scope.reloadLadder();
    })

  })
  .config( function( $stateProvider ) {

    $stateProvider.state( "ladderDetail", {

      url:          "/ladders/:ladderId",
      templateUrl:  "/views/ladder_detail.html",
      controller:   "LadderDetailCtrl",
      resolve: {
        ladder : function( LadderFactory, $stateParams ) {
          return LadderFactory.fetchById( $stateParams.ladderId );
        },
      }

    });

  });