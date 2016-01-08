var router = require( 'express' ).Router();

router.use( '/ladders/', require( './ladder' ) );

module.exports = router;