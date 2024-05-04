import { parentPort } from 'worker_threads'

main()

function main() {
  setInterval(() => parentPort?.postMessage(`Hello ${Math.random()}`), 1000)
}
