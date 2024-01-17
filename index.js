const express = require('express')
const app = express()
app.use(express.json())

var morgan = require('morgan')
morgan.token('body', function (req, res) { 
    if (req.method == "POST") {
        return JSON.stringify(req.body)
    }
    return ""
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const cors = require('cors')
app.use(cors())

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/info', (request, response) => {
    const currentDate = new Date(); 
    response.send(`Phonebook has info for ${persons.length} people <br/><br/> ${currentDate.toString()}`)
})

app.get('/api/persons/:id', (request, response) => {
    const person = persons.find(p => p.id == request.params.id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(p => p.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const id = Math.floor(Math.random() * 1e7) + persons.length
    const person = structuredClone(request.body)
    if ((!Object.keys(person).includes("name") || !Object.keys(person).includes("number")) || (person.name == null || person.number == null || person.name == "" || person.number == "")){
        return response.status(400).json({ 
            error: 'missing name or number' 
        })
    } else if (persons.filter(p => p.name == person.name).length > 0) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
    person.id = id
    persons = persons.concat(person)
    response.json(person)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})