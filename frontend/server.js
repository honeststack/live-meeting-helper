const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { WebSocketServer } = require('ws')
const { SpeechClient } = require('@google-cloud/speech')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Google Cloud Speech client
let speechClient = null

function getSpeechClient() {
  if (!speechClient) {
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
    if (credentialsPath) {
      const absolutePath = path.isAbsolute(credentialsPath)
        ? credentialsPath
        : path.join(__dirname, '..', credentialsPath)

      speechClient = new SpeechClient({
        keyFilename: absolutePath,
      })
      console.log('Google Cloud Speech client initialized with:', absolutePath)
    } else {
      // Try default credentials
      speechClient = new SpeechClient()
      console.log('Google Cloud Speech client initialized with default credentials')
    }
  }
  return speechClient
}

// Audio processing utilities
function convertWebmToLinear16(webmBuffer) {
  // For now, we'll use a simplified approach
  // In production, you'd want to use ffmpeg or a proper audio decoder
  // The browser sends webm/opus which needs to be decoded to PCM
  return webmBuffer
}

// Streaming recognition session
class TranscriptionSession {
  constructor(ws) {
    this.ws = ws
    this.recognizeStream = null
    this.audioBuffer = Buffer.alloc(0)
    this.isActive = false
    this.restartTimeout = null
    this.streamingLimit = 290000 // ~5 minutes, restart before 305s limit
  }

  start() {
    if (this.isActive) return
    this.isActive = true
    this.createStream()
  }

  createStream() {
    try {
      const client = getSpeechClient()

      const request = {
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
          model: 'latest_long',
        },
        interimResults: true,
      }

      this.recognizeStream = client
        .streamingRecognize(request)
        .on('error', (err) => {
          console.error('Recognition stream error:', err.message)
          // Don't send error for expected timeouts
          if (!err.message.includes('exceeded') && this.ws.readyState === 1) {
            this.ws.send(JSON.stringify({
              type: 'error',
              message: err.message,
            }))
          }
          this.restartStream()
        })
        .on('data', (data) => {
          if (data.results?.[0]) {
            const result = data.results[0]
            const transcript = result.alternatives?.[0]?.transcript || ''
            const isFinal = result.isFinal

            if (transcript && this.ws.readyState === 1) {
              this.ws.send(JSON.stringify({
                type: 'transcript',
                text: transcript,
                isFinal: isFinal,
                confidence: result.alternatives?.[0]?.confidence,
              }))
            }
          }
        })
        .on('end', () => {
          console.log('Recognition stream ended')
          if (this.isActive) {
            this.restartStream()
          }
        })

      console.log('Recognition stream created')

      // Set up restart timer to avoid 305s limit
      this.restartTimeout = setTimeout(() => {
        if (this.isActive) {
          console.log('Restarting stream due to time limit')
          this.restartStream()
        }
      }, this.streamingLimit)

    } catch (err) {
      console.error('Failed to create recognition stream:', err)
      if (this.ws.readyState === 1) {
        this.ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to start transcription: ' + err.message,
        }))
      }
    }
  }

  restartStream() {
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout)
      this.restartTimeout = null
    }

    if (this.recognizeStream) {
      this.recognizeStream.end()
      this.recognizeStream = null
    }

    if (this.isActive) {
      // Small delay before restarting
      setTimeout(() => {
        if (this.isActive) {
          this.createStream()
        }
      }, 100)
    }
  }

  processAudio(audioData) {
    if (!this.isActive || !this.recognizeStream) {
      return
    }

    try {
      // Write audio data to the stream
      this.recognizeStream.write(audioData)
    } catch (err) {
      console.error('Error writing to stream:', err.message)
    }
  }

  stop() {
    this.isActive = false

    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout)
      this.restartTimeout = null
    }

    if (this.recognizeStream) {
      try {
        this.recognizeStream.end()
      } catch (err) {
        console.error('Error ending stream:', err.message)
      }
      this.recognizeStream = null
    }
  }
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error handling request:', err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })

  // WebSocket server for transcription
  const wss = new WebSocketServer({
    server,
    path: '/api/transcribe',
  })

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected')

    const session = new TranscriptionSession(ws)
    session.start()

    ws.on('message', (message) => {
      // Receive audio data and process it
      if (Buffer.isBuffer(message) || message instanceof ArrayBuffer) {
        const buffer = Buffer.isBuffer(message) ? message : Buffer.from(message)
        session.processAudio(buffer)
      }
    })

    ws.on('close', () => {
      console.log('WebSocket client disconnected')
      session.stop()
    })

    ws.on('error', (err) => {
      console.error('WebSocket error:', err)
      session.stop()
    })
  })

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> WebSocket transcription available at ws://${hostname}:${port}/api/transcribe`)
  })
})
