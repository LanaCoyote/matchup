angular
  .module( "matchup" )
  .controller( "LadderCreateCtrl", function( $scope, $state, LadderFactory ) {

    $scope.newLadder = {
      title: "",
      playerList: [{
        name: "",
        seed: 1
      }]
    }

    $scope.addPlayer = function() {

      $scope.newLadder.playerList.push({
        name: "",
        seed: $scope.newLadder.playerList.length + 1
      });

    }

    $scope.createLadder = function() {

      LadderFactory.createFromPlayerList( $scope.newLadder.title, $scope.newLadder.playerList )
      .then( function( ladder ) {

        $state.go(  "ladderDetail", { ladderId: ladder._id } );

      });

    }

  })
  .config( function( $stateProvider ) {

    $stateProvider.state( "ladderCreate", {

      url:          "/create_ladder",
      templateUrl:  "/views/ladder_create.html",
      controller:   "LadderCreateCtrl",

    });

  });