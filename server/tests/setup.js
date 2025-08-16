import mongoose from 'mongoose';

// Add reload method to mongoose documents for testing
mongoose.Document.prototype.reload = function() {
  return this.constructor.findById(this._id);
};