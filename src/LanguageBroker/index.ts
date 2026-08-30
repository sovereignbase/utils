import type { BCP47LanguageTag } from '../BCP47LanguageTag/index.js'

export class LanguageBroker {
  private eventTarget: EventTarget = new EventTarget()
  private language: BCP47LanguageTag
  private onchange: undefined | ((language: BCP47LanguageTag) => void)
  private listeners: number = 0
  constructor(
    initialLanguage: BCP47LanguageTag,
    onchange?: (language: BCP47LanguageTag) => void
  ) {
    this.language = initialLanguage
    this.onchange = onchange
  }
  public get(): BCP47LanguageTag {
    return this.language
  }
  public set(language: BCP47LanguageTag): void {
    this.language = language
    if (typeof this.onchange === 'function') void typeof this.onchange(language)
    if (this.listeners > 0)
      void this.eventTarget.dispatchEvent(
        new CustomEvent<BCP47LanguageTag>('change', { detail: language })
      )
  }

  /**
   * Registers an event listener.
   *
   * @param type - The event type.
   * @param listener - The listener to register.
   * @param options - The event listener options.
   */
  public addEventListener<K extends keyof LanguageEventMap>(
    type: K,
    listener: LanguageEventListenerFor<K> | null,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.listeners++
    return void this.eventTarget.addEventListener(
      type,
      listener as EventListenerOrEventListenerObject | null,
      options
    )
  }

  /**
   * Removes a previously registered event listener.
   *
   * @param type - The event type.
   * @param listener - The listener to remove.
   * @param options - The event listener options.
   */
  public removeEventListener<K extends keyof LanguageEventMap>(
    type: K,
    listener: LanguageEventListenerFor<K> | null,
    options?: boolean | EventListenerOptions
  ): void {
    this.listeners--
    return void this.eventTarget.removeEventListener(
      type,
      listener as EventListenerOrEventListenerObject | null,
      options
    )
  }
}

/**
 * Maps each event dispatched by {@link Language} to its payload.
 *
 * @typeParam Topic - The topic identifier type.
 * @typeParam RPCRequest - The RPC request payload type.
 * @typeParam RPCResponse - The RPC response payload type.
 */
export type LanguageEventMap = {
  change: BCP47LanguageTag
}

/**
 * A function or object that handles a {@link Language} event.
 *
 * @typeParam Topic - The topic identifier type.
 * @typeParam RPCRequest - The RPC request payload type.
 * @typeParam RPCResponse - The RPC response payload type.
 * @typeParam K - The event type.
 */
export type LanguageEventListener<K extends keyof LanguageEventMap> =
  | ((event: CustomEvent<LanguageEventMap[K]>) => void)
  | {
      handleEvent(event: CustomEvent<LanguageEventMap[K]>): void
    }

/**
 * Resolves a typed {@link Language} listener for known event types and a
 * standard DOM event listener for other event types.
 *
 * @typeParam Topic - The topic identifier type.
 * @typeParam RPCRequest - The RPC request payload type.
 * @typeParam RPCResponse - The RPC response payload type.
 * @typeParam K - The event type.
 */
export type LanguageEventListenerFor<K extends string> =
  K extends keyof LanguageEventMap
    ? LanguageEventListener<K>
    : EventListenerOrEventListenerObject
