import { parentPort } from 'worker_threads'

main()

function main() {
  let count = 0
  setInterval(() => parentPort?.postMessage(`Hello ${++count}`), 500)
}
