const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User } = require('../models')

const register = async (req, res) => {
  const { email, password, username } = req.body

  try {
    const existingUser = await User.findOne({ where: { email } })

    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await User.create({ email, username: username, password: hashedPassword })
    const token = jwt.sign({ userId: newUser.id }, 'my-key', { expiresIn: '1h' });

    res.status(201).json({ token })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const login = async (req, res) => {
  console.log("passou aqui")
  const { email, password } = req.body

  try {
    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ userId: user.id }, 'token', { expiresIn: '1h' })

    res.json({ token })
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}

module.exports = {
  register,
  login
}
