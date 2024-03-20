const mongoose = require('mongoose');

const activitiesSchema = mongoose.Schema({
    name: String,
    location: {
        name: String,
        lat: Number,
        lng: Number
    },
    date : Date,
    picture : String,
    url: String,
    description : String,
    budget: Number,
    participation: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        status: Boolean,
        userToken: String
    }],
    isFixed: Boolean,
   });

const accommodationsSchema = mongoose.Schema({
    name: String,
    location: {
        name: String,
        lat: Number,
        lng: Number
    },
    dates : {
        departure : Date,
        return: Date
    },
    photos : [String],
    url: String,
    description : String,
    budget: Number,
    vote: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        status: Boolean,
        userToken: String, 
    }],
    isFixed: Boolean,
});

const chatSchema = mongoose.Schema({
    // author: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    author : String,
    date: Date,
    message: String
})

const tripSchema = mongoose.Schema({
    name : String,
    location: {
        name: String,
        lat: Number,
        lng: Number
    },
    dates : {
        departure : Date,
        return: Date
    },
    budget : Number,
    admin : { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, 
    members : [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    activities : [activitiesSchema],    
    accommodations :[accommodationsSchema], 
    chat : [chatSchema]
});

const Trip = mongoose.model('trips', tripSchema);

module.exports = Trip;