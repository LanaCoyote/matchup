var chalk = require( 'chalk' );
var mongoose = require( 'mongoose' ) // mongoose for schema construction

var PlayerSchema = new mongoose.Schema({

  name: { type: String, required: true, time: true },
  seed: { type: Number, required: true },
  ladder: { type: mongoose.Schema.Types.ObjectId, ref: 'Ladder' },

});

PlayerSchema.methods.toString = function() {

  return this.name + " (" + this.seed + ")";

}

module.exports = mongoose.model( 'Player', PlayerSchema );