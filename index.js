require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')


const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('resp', (req, res) => {
  return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :response-time ms :resp'))

const Person = require('./models/person')


app.get('/', (request, response) => {
  response.send('<h1>Fullstack open BE</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
  Person.countDocuments({}).then(count => {
    const now = new Date()
    const formattedTime = now.toString()
    const responseInfo = `
            <p>Phonebook has info for ${count} people</p>
            <p>${formattedTime}</p>
        `
    response.send(responseInfo)
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const { name, number } = request.body  // Extract name and number from the request body

  const person = {
    name,
    number
  }

  Person.findByIdAndUpdate(id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).json({ error: 'person not found' })
      }
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  console.log(request.params.id)
  Person.findByIdAndDelete(request.params.id).then(result => {
    response.status(204).end()
  }).catch(error => next(error))
})

app.post('/api/persons', (request, response,next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint ' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
