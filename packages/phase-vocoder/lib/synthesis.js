import { zeros, add } from 'dsp-array'
import { rectangular } from 'dsp-spectrum'
import { ifftshift } from 'dsp-fftshift'

/**
 * Synthesize a signal from a collection of frames
 * @private
 * @param {Array<Object>} frames - an array of frames (`{ magnitudes, phases }`)
 * @param {Object} options - All required: size, hop, sampeRate, factor
 * @param {Array} output - (Optional) the output array
 */
export default function synthesis (frames, { ft, size, hop, sampleRate, factor }, output) {
  if (!frames || !frames.length) throw Error('"frames" parameter is required in synthesis')

  var len = frames.length
  var hopS = hop * factor
  console.log('SYNTHESIS', hop, hopS, len, len * hopS, output)
  if (!output) output = zeros(len * hopS + size)
  var position = 0

  // create some intermediate buffers (and reuse it for performance)
  var rectFD = { real: zeros(size), imag: zeros(size) }
  var timeDomain = { real: zeros(size), imag: zeros(size) }
  for (var i = 0; i < len; i++) {
    // 1. Convert freq-domain from polar to rectangular
    rectangular(frames[i], rectFD)
    // 2. Convert from freq-domain in rectangular to time-domain
    var signal = ft.inverse(rectFD, timeDomain).real
    // 3. Unshift the previous cycling shift
    ifftshift(signal)
    // 4. Overlap add
    var write = output.subarray(position, position + hopS)
    add(hopS, signal, write, write)
    position += hopS
  }
  return output
}
