/**
 * Creates a function that runs the callback after no calls have happened for
 * the requested timeout.
 *
 * @param timeout Milliseconds to wait after the latest call.
 * @param callback Function to run after the idle timeout expires.
 * @returns Function that restarts the idle timeout whenever it is called.
 */
export function afterIdleFor(
  timeout: number,
  callback: () => void
): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined

  return () => {
    clearTimeout(timer)

    timer = setTimeout(() => {
      callback()
    }, timeout)
  }
}
