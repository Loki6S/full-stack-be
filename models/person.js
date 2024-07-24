const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGO_URI

mongoose.connect(url)

const phoneBookSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    required: [true, 'Phone number required'],
    minLength:8,
    validate:{
      validator: function(v){
        return /^(\d{2,4}-\d{6,8})$/.test(v)
      },
      message: props => `${props.value} is not a valid number`
    }
  },
})
phoneBookSchema.set('toJSON',{
  transform:(document,returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Contact', phoneBookSchema)