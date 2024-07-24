const mongoose = require('mongoose')

if(process.argv.length < 3){
  console.log('password should be provided as an argument.')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://lokendra24:${password}@atlascluster.xne4lva.mongodb.net/phoneBookApp?retryWrites=true&w=majority&appName=AtlasCluster`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const phoneBookSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Contact = mongoose.model('Contact',phoneBookSchema)

if (name && number){
  const contact = new Contact({
    name:name,
    number:number,
  })

  contact.save().then(result => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
    .catch(err => {
      console.log('Error saving contact:', err.message)
      mongoose.connection.close()
    })
}else {
  Contact.find({}).then(result => {
    result.forEach(contact => {
      console.log(contact)
    })
    mongoose.connection.close()
  })
}
