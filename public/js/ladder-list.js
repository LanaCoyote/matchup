angular
  .module( "matchup" )
  .controller( "LadderListCtrl", function( $scope, ladders ) {

    $scope.ladders = ladders;

  })
  .config( function( $stateProvider, $urlRouterProvider ) {

    // set our default route
    $urlRouterProvider.when( "/", "/ladders" );

    $stateProvider.state( "ladderList", {

      url:          "/ladders",
      templateUrl:  "/views/ladder_list.html",
      controller:   "LadderListCtrl",
      resolve: {
        ladders : function( LadderFactory ) {
          return LadderFactory.fetchAll();
        },
      }

    });

  });