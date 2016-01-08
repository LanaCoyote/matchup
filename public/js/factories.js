angular
  .module( "matchup" )
  .factory( "LadderFactory", function( $http ) {

    var LadderFactory = {};

    LadderFactory.fetchAll = function() {

      return $http.get( "/api/ladders" )
      .then( function( res ) {
        return res.data;
      });

    }

    LadderFactory.fetchById = function( id ) {

      return $http.get( "/api/ladders/" + id.toString() )
      .then( function( res ) {
        return res.data;
      })
      .then( function( ladder ) {

        //var bracketCount = ladder.brackets.length;
        return Promise.all( ladder.brackets.map( function( bracketId, bracketIdx ) {
          return $http.get( "/api/ladders/" + id.toString() + "/brackets/" + bracketIdx );
        }))
        .then( function( reses ) {
          return reses.map( function( res ) { return res.data } );
        })
        .then( function( brackets ) {
          ladder.brackets = brackets.reverse();
          return ladder;
        });

      });

    }

    LadderFactory.reportMatchWinner = function( ladderId, matchId, winner ) {

      var postData = {
        matchId: matchId,
        winner: winner
      }

      return $http.post( "/api/ladders/" + ladderId + "/reportWinner", postData )
      .then( function( res ) {
        return res.data;
      }).then( function( match ) {
        return match;
      });

    }

    LadderFactory.createFromPlayerList = function( title, playerList ) {

      var postData = {
        title: title,
        players: playerList
      }

      return $http.post( "/api/ladders/", postData )
      .then( function( res ) {
        return res.data;
      })

    }

    return LadderFactory;

  });