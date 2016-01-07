var router = require( 'express' ).Router();

router.use( '/ladder/', require( './ladder' ) );

module.exports = router;