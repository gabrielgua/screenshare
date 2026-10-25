const ARRIVAL_TONE_FREQUENCIES_IN_HERTZ = [660, 880]
const DEPARTURE_TONE_FREQUENCIES_IN_HERTZ = [660, 440]
const TONE_DURATION_IN_SECONDS = 0.16
const SECONDS_BETWEEN_TONES = 0.11
const PEAK_TONE_VOLUME = 0.12
const SILENT_VOLUME = 0.0001

let sharedAudioContext: AudioContext | undefined

function readAudioContext(): AudioContext {
  sharedAudioContext ??= new AudioContext()
  if (sharedAudioContext.state === 'suspended') {
    void sharedAudioContext.resume()
  }
  return sharedAudioContext
}

function playToneSequence(frequenciesInHertz: number[]) {
  const audioContext = readAudioContext()
  frequenciesInHertz.forEach((frequencyInHertz, toneIndex) => {
    const toneStartTime = audioContext.currentTime + toneIndex * SECONDS_BETWEEN_TONES
    const toneEndTime = toneStartTime + TONE_DURATION_IN_SECONDS
    const oscillator = audioContext.createOscillator()
    const volume = audioContext.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = frequencyInHertz
    volume.gain.setValueAtTime(SILENT_VOLUME, toneStartTime)
    volume.gain.exponentialRampToValueAtTime(PEAK_TONE_VOLUME, toneStartTime + 0.02)
    volume.gain.exponentialRampToValueAtTime(SILENT_VOLUME, toneEndTime)
    oscillator.connect(volume).connect(audioContext.destination)
    oscillator.start(toneStartTime)
    oscillator.stop(toneEndTime + 0.05)
  })
}

export function playRoomArrivalSound() {
  playToneSequence(ARRIVAL_TONE_FREQUENCIES_IN_HERTZ)
}

export function playRoomDepartureSound() {
  playToneSequence(DEPARTURE_TONE_FREQUENCIES_IN_HERTZ)
}
